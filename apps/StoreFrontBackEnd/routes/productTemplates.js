const { ObjectId } = require('mongodb');
const Router = require('express').Router;
const novaMongoDBRepository = require('../Repositories/NovaMongoDBRepository');

const router = Router();

// Collection names
const COL = 'ProductTemplates';

// Helpers
const now = () => new Date();
const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

function normalizeTemplate(payload) {
  const key = payload?.key ?? payload?.Key;
  const name = payload?.name ?? payload?.Name;
  const blocks = payload?.blocks ?? payload?.Blocks ?? [];
  const isDefault = Boolean(payload?.isDefault ?? payload?.IsDefault ?? false);

  return {
    key: isNonEmptyString(key) ? key.trim() : null,
    name: isNonEmptyString(name) ? name.trim() : null,
    blocks: Array.isArray(blocks) ? blocks : [],
    isDefault,
  };
}

// GET all templates
router.get('/product-templates', async (req, res) => {
  try {
    const db = novaMongoDBRepository.getMongoRepository();
    const templates = await db.collection(COL)
      .find({}, { projection: { key: 1, name: 1, isDefault: 1, updatedAt: 1 } })
      .sort({ isDefault: -1, updatedAt: -1 })
      .toArray();

    res.status(200).json(templates);
  } catch (err) {
    console.error('Error fetching product templates:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET template by key
router.get('/product-templates/:key', async (req, res) => {
  try {
    const db = novaMongoDBRepository.getMongoRepository();
    const key = req.params.key;

    const template = await db.collection(COL).findOne({ key });

    if (!template) return res.status(404).json({ message: 'Template not found' });

    res.status(200).json(template);
  } catch (err) {
    console.error('Error fetching product template:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create template
router.post('/product-templates', async (req, res) => {
  try {
    const db = novaMongoDBRepository.getMongoRepository();
    const t = normalizeTemplate(req.body);

    if (!t.key || !t.name) {
      return res.status(400).json({ message: 'key and name are required' });
    }

    const existing = await db.collection(COL).findOne({ key: t.key });
    if (existing) return res.status(409).json({ message: 'Template key already exists' });

    // If setting default, unset others
    if (t.isDefault) {
      await db.collection(COL).updateMany({ isDefault: true }, { $set: { isDefault: false, updatedAt: now() } });
    }

    const doc = {
      key: t.key,
      name: t.name,
      blocks: t.blocks,
      isDefault: t.isDefault,
      createdAt: now(),
      updatedAt: now(),
    };

    const result = await db.collection(COL).insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (err) {
    console.error('Error creating product template:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH update template by key
router.patch('/product-templates/:key', async (req, res) => {
  try {
    const db = novaMongoDBRepository.getMongoRepository();
    const key = req.params.key;

    const t = normalizeTemplate({ ...req.body, key });

    if (!t.name) {
      return res.status(400).json({ message: 'name is required' });
    }

    // If setting default, unset others
    if (t.isDefault) {
      await db.collection(COL).updateMany({ key: { $ne: key }, isDefault: true }, { $set: { isDefault: false, updatedAt: now() } });
    }

    const update = {
      $set: {
        name: t.name,
        blocks: t.blocks,
        isDefault: t.isDefault,
        updatedAt: now(),
      },
    };

    const result = await db.collection(COL).findOneAndUpdate({ key }, update, { returnDocument: 'after' });

    if (!result.value) return res.status(404).json({ message: 'Template not found' });

    res.status(200).json(result.value);
  } catch (err) {
    console.error('Error updating product template:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
