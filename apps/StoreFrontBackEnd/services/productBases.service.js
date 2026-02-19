// services/productBases.service.js
const ProductBase = require('../models/ProductBase');

exports.getProductBases = async ({ page = 1, pageSize = 25, q = '' } = {}) => {
  page = Math.max(parseInt(page, 10) || 1, 1);
  pageSize = Math.min(Math.max(parseInt(pageSize, 10) || 25, 1), 200);
  q = String(q || '').trim();

  const filter = q
    ? {
        $or: [
          { _id: { $regex: escapeRegex(q), $options: 'i' } },
          { Name: { $regex: escapeRegex(q), $options: 'i' } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    ProductBase.find(filter)
      .sort({ DisplayOrder: 1, Name: 1, _id: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    ProductBase.countDocuments(filter),
  ]);

  return { page, pageSize, total, items };
};

exports.getProductBaseById = async (id) => {
  const key = normalizeId(id);
  if (!key) return null;
  return await ProductBase.findById(key).lean();
};

exports.createProductBase = async (base) => {
  if (!base || typeof base !== 'object') {
    throw new Error('Invalid BaseProduct payload.');
  }

  const _id = normalizeId(base._id);
  if (!_id) throw new Error('_id is required (string).');

  const name = typeof base.Name === 'string' ? base.Name.trim() : '';
  if (!name) throw new Error('Name is required (string).');

  if (!base.Defaults || typeof base.Defaults !== 'object' || Array.isArray(base.Defaults)) {
    throw new Error('Defaults is required (object).');
  }

  const exists = await ProductBase.exists({ _id });
  if (exists) {
    const err = new Error('BaseProduct already exists.');
    err.status = 409;
    throw err;
  }

  const doc = new ProductBase({
    ...base,
    _id,
    Name: name,
    StatusID: base.StatusID ?? 1,
    DisplayOrder: base.DisplayOrder ?? 0,
    Audit: {
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await doc.save();
  return doc.toObject();
};

exports.updateProductBase = async (id, patch) => {
  const key = normalizeId(id);
  if (!key) return null;

  if (!patch || typeof patch !== 'object') {
    throw new Error('Invalid patch payload.');
  }

  // Disallow changing primary key
  if (patch._id && normalizeId(patch._id) !== key) {
    throw new Error('Cannot change _id of BaseProduct.');
  }
  delete patch._id;

  // Lightweight validation on provided fields
  if (patch.Name !== undefined && typeof patch.Name !== 'string') {
    throw new Error('Name must be a string.');
  }
  if (patch.Defaults !== undefined) {
    if (typeof patch.Defaults !== 'object' || patch.Defaults === null || Array.isArray(patch.Defaults)) {
      throw new Error('Defaults must be an object.');
    }
  }
  if (patch.SchemaHints !== undefined) {
    if (typeof patch.SchemaHints !== 'object' || patch.SchemaHints === null || Array.isArray(patch.SchemaHints)) {
      throw new Error('SchemaHints must be an object.');
    }
  }
  if (patch.StatusID !== undefined && typeof patch.StatusID !== 'number') {
    throw new Error('StatusID must be a number.');
  }
  if (patch.DisplayOrder !== undefined && typeof patch.DisplayOrder !== 'number') {
    throw new Error('DisplayOrder must be a number.');
  }

  const $set = {
    ...patch,
    ...(patch.Name ? { Name: patch.Name.trim() } : {}),
    'Audit.UpdatedAt': new Date(),
  };

  const updated = await ProductBase.findByIdAndUpdate(
    key,
    { $set },
    { new: true }
  ).lean();

  return updated || null;
};

exports.deleteProductBase = async (id) => {
  const key = normalizeId(id);
  if (!key) return null;

  const deleted = await ProductBase.findByIdAndDelete(key).lean();
  return deleted || null;
};


exports.cloneProductBase = async (id, opts = {}) => {
  const sourceId = normalizeId(id);
  if (!sourceId) return null;

  const source = await ProductBase.findById(sourceId).lean();
  if (!source) return null;

  const now = new Date();
  const suffix = typeof opts.suffix === 'string' && opts.suffix.trim() ? opts.suffix.trim() : 'COPY';
  const proposedId = typeof opts.newId === 'string' && opts.newId.trim()
    ? opts.newId.trim()
    : `${sourceId}_${suffix}_${Date.now()}`;

  const newId = normalizeId(proposedId);
  if (!newId) throw new Error('newId is required.');

  const exists = await ProductBase.exists({ _id: newId });
  if (exists) {
    const err = new Error('BaseProduct clone target already exists.');
    err.status = 409;
    throw err;
  }

  const name =
    (typeof opts.newName === 'string' && opts.newName.trim())
      ? opts.newName.trim()
      : `${source.Name} (Copy)`;

  const cloned = {
    ...source,
    _id: newId,
    Name: name,
    Audit: {
      CreatedAt: now,
      UpdatedAt: now,
    },
  };

  // Safety: ensure Defaults is an object
  if (!cloned.Defaults || typeof cloned.Defaults !== 'object') cloned.Defaults = {};

  const doc = new ProductBase(cloned);
  await doc.save();
  return doc.toObject();
};


function normalizeId(id) {
  const s = id != null ? String(id).trim() : '';
  return s.length ? s : null;
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
