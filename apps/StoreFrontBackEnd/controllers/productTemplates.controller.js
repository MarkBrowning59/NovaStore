// controllers/productTemplates.controller.js
const ProductTemplate = require('../models/ProductTemplate');

async function unsetOtherDefaults(exceptKey) {
  await ProductTemplate.updateMany(
    { key: { $ne: exceptKey }, isDefault: true },
    { $set: { isDefault: false } }
  );
}

exports.listProductTemplates = async (req, res, next) => {
  try {
    const templates = await ProductTemplate.find({}).sort({ isDefault: -1, name: 1 });
    res.json(templates);
  } catch (err) {
    next(err);
  }
};

exports.getProductTemplateByKey = async (req, res, next) => {
  try {
    const { key } = req.params;
    const template = await ProductTemplate.findOne({ key });
    if (!template) return res.status(404).json({ message: 'Product template not found.' });
    res.json(template);
  } catch (err) {
    next(err);
  }
};

exports.createProductTemplate = async (req, res, next) => {
  try {
    const { key, name, blocks, isDefault } = req.body || {};
    if (!key || !name) {
      return res.status(400).json({ message: 'key and name are required.' });
    }

    const created = await ProductTemplate.create({
      key,
      name,
      blocks: Array.isArray(blocks) ? blocks : [],
      isDefault: !!isDefault,
    });

    if (created.isDefault) {
      await unsetOtherDefaults(created.key);
    }

    res.status(201).json(created);
  } catch (err) {
    // Duplicate key error
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'A template with that key already exists.' });
    }
    next(err);
  }
};

exports.updateProductTemplateByKey = async (req, res, next) => {
  try {
    const { key } = req.params;
    const patch = req.body || {};

    // Only allow editable fields
    const update = {};
    if (typeof patch.name === 'string') update.name = patch.name;
    if (Array.isArray(patch.blocks)) update.blocks = patch.blocks;
    if (typeof patch.isDefault === 'boolean') update.isDefault = patch.isDefault;

    const updated = await ProductTemplate.findOneAndUpdate(
      { key },
      { $set: update },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Product template not found.' });

    if (updated.isDefault) {
      await unsetOtherDefaults(updated.key);
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

function newBlockId() {
  return `blk_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36)}`;
}

function cloneBlocksWithNewIds(blocks = []) {
  return (Array.isArray(blocks) ? blocks : []).map((b) => ({
    ...b,
    id: newBlockId(),
    // deep clone props to avoid shared refs
    props: b?.props && typeof b.props === 'object' ? JSON.parse(JSON.stringify(b.props)) : b?.props,
  }));
}

exports.deleteProductTemplateByKey = async (req, res, next) => {
  try {
    const { key } = req.params;
    const deleted = await ProductTemplate.findOneAndDelete({ key });
    if (!deleted) return res.status(404).json({ message: 'Product template not found.' });

    // If the deleted template was default, promote the first remaining template to default.
    if (deleted.isDefault) {
      const nextDefault = await ProductTemplate.findOne({}).sort({ name: 1 });
      if (nextDefault) {
        nextDefault.isDefault = true;
        await nextDefault.save();
        await unsetOtherDefaults(nextDefault.key);
      }
    }

    res.json({ deleted: true, key: deleted.key });
  } catch (err) {
    next(err);
  }
};

exports.cloneProductTemplateByKey = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { newKey, name } = req.body || {};
    if (!newKey) return res.status(400).json({ message: 'newKey is required.' });

    const source = await ProductTemplate.findOne({ key });
    if (!source) return res.status(404).json({ message: 'Source template not found.' });

    const created = await ProductTemplate.create({
      key: newKey,
      name: typeof name === 'string' && name.trim() ? name.trim() : `${source.name} (Copy)`,
      isDefault: false,
      blocks: cloneBlocksWithNewIds(source.blocks || []),
    });

    res.status(201).json(created);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'A template with that key already exists.' });
    }
    next(err);
  }
};
