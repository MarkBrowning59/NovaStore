// services/products.service.js
const Product = require('../models/Product');
const ProductBase = require('../models/ProductBase');

exports.getProducts = async ({ page = 1, pageSize = 10, system = 'XMPie' } = {}) => {
  page = Math.max(parseInt(page, 10) || 1, 1);
  pageSize = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 200);

  const filter =
    system && system !== 'ALL'
      ? { 'IDs.System': { $regex: `^${escapeRegex(system)}$`, $options: 'i' } }
      : {};

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort({ 'ProductDefinition.Name': 1, _id: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return { page, pageSize, total, items };
};

exports.getProductById = async (id) => {
  const key = normalizeId(id);
  if (!key) return null;
  return await Product.findById(key).lean();
};

exports.getBySystemId = async (system, id) => {
  const sys = String(system || '').trim();
  const sid = String(id || '').trim();
  if (!sys || !sid) return null;

  // Match either exact system+id in IDs array, or StoreFront-ish ids
  const q = {
    $or: [
      { 'IDs': { $elemMatch: { System: sys, ID: sid } } },
      { 'IDs': { $elemMatch: { System: { $regex: `^${escapeRegex(sys)}$`, $options: 'i' }, ID: sid } } },
      { _id: sid },
      { 'IDs.ID': sid },
    ],
  };

  return await Product.findOne(q).lean();
};

exports.createProduct = async (product) => {
  if (!product || typeof product !== 'object') throw new Error('Invalid Product payload.');

  // Optional: allow Mongo/Mongoose default _id (see Product model default)
  const providedId = product._id != null ? normalizeId(product._id) : null;

  // Basic required schema field enforcement
  const name = product?.ProductDefinition?.Name ? String(product.ProductDefinition.Name).trim() : '';
  if (!name) throw new Error('ProductDefinition.Name is required.');

  if (!Array.isArray(product.CatalogIds) || product.CatalogIds.length === 0) {
    throw new Error('CatalogIds must be a non-empty array.');
  }

  if (providedId) {
    const exists = await Product.exists({ _id: providedId });
    if (exists) {
      const err = new Error('Product already exists.');
      err.status = 409;
      throw err;
    }
  }

  const doc = new Product({
    ...product,
    // If caller provided an id, use it; otherwise allow model default to generate one
    ...(providedId ? { _id: providedId } : {}),
    ProductDefinition: {
      ...(product.ProductDefinition || {}),
      Name: name,
    },
  });

  await doc.save();
  return doc.toObject();
};


exports.updateProduct = async (id, patch) => {
  const key = normalizeId(id);
  if (!key) return null;

  if (!patch || typeof patch !== 'object') throw new Error('Invalid patch payload.');

  // Disallow changing primary key
  if (patch._id && normalizeId(patch._id) !== key) throw new Error('Cannot change _id of Product.');
  delete patch._id;

  const $set = { ...patch };

  // Optionally trim name if provided
  if ($set?.ProductDefinition?.Name != null) {
    $set.ProductDefinition = { ...(patch.ProductDefinition || {}) };
    $set.ProductDefinition.Name = String(patch.ProductDefinition.Name).trim();
  }

  const updated = await Product.findByIdAndUpdate(key, { $set }, { new: true }).lean();
  return updated || null;
};

exports.deleteProduct = async (id) => {
  const key = normalizeId(id);
  if (!key) return null;
  const deleted = await Product.findByIdAndDelete(key).lean();
  return deleted || null;
};

/**
 * Clone a Product.
 * POST /api/products/:id/clone
 * body: { newId?, newName?, suffix?, keepCatalogIds? }
 */
/**
 * Clone a Product.
 * POST /api/products/:id/clone
 * body: { newId?, newName?, suffix?, keepCatalogIds?, catalogId?, catalogIds? }
 *
 * Notes:
 * - Product schema requires CatalogIds to be non-empty.
 * - Default behavior: keep source CatalogIds when present.
 * - If source has none, you MUST provide catalogId/catalogIds (we throw 400 with a clear message).
 */
exports.cloneProduct = async (id, opts = {}) => {
  const sourceId = normalizeId(id);
  if (!sourceId) return null;

  const source = await Product.findById(sourceId).lean();
  if (!source) return null;

  const suffix = typeof opts.suffix === 'string' && opts.suffix.trim() ? opts.suffix.trim() : 'COPY';
  const proposedId = typeof opts.newId === 'string' && opts.newId.trim()
    ? opts.newId.trim()
    : `${sourceId}_${suffix}_${Date.now()}`;

  const newId = normalizeId(proposedId);
  if (!newId) {
    const err = new Error('newId is required.');
    err.status = 400;
    throw err;
  }

  const exists = await Product.exists({ _id: newId });
  if (exists) {
    const err = new Error('Product clone target already exists.');
    err.status = 409;
    throw err;
  }

  const keepCatalogIds = opts.keepCatalogIds !== undefined ? !!opts.keepCatalogIds : true;

  const sourceCatalogIds = Array.isArray(source.CatalogIds) ? source.CatalogIds.filter(Boolean).map(String) : [];
  const providedCatalogIds = Array.isArray(opts.catalogIds)
    ? opts.catalogIds.filter(Boolean).map(String)
    : [];

  const providedCatalogId = opts.catalogId != null && String(opts.catalogId).trim()
    ? [String(opts.catalogId).trim()]
    : [];

  let catalogIds = [];

  if (providedCatalogIds.length) catalogIds = providedCatalogIds;
  else if (providedCatalogId.length) catalogIds = providedCatalogId;
  else if (keepCatalogIds) catalogIds = sourceCatalogIds;
  else catalogIds = [];

  if (!catalogIds.length) {
    const err = new Error(
      'CatalogIds is required to clone a product. Provide catalogId or catalogIds in the clone request (or clone from a product that already has CatalogIds).'
    );
    err.status = 400;
    throw err;
  }

  const newName =
    (typeof opts.newName === 'string' && opts.newName.trim())
      ? opts.newName.trim()
      : `${source?.ProductDefinition?.Name || sourceId} (Copy)`;

  const cloned = {
    ...source,
    _id: newId,
    CatalogIds: catalogIds,
  };

  cloned.ProductDefinition = { ...(source.ProductDefinition || {}) };
  cloned.ProductDefinition.Name = newName;

  // IDs array: ensure StoreFront ID equals new _id
  const ids = Array.isArray(source.IDs) ? [...source.IDs] : [];
  const filtered = ids.filter((x) => {
    if (!x || x.System == null) return false;
    const sys = String(x.System).trim().toUpperCase();
    return sys !== 'STOREFRONT';
  });
  filtered.unshift({ System: 'StoreFront', ID: newId });
  cloned.IDs = filtered;

  try {
    const doc = new Product(cloned);
    await doc.save();
    return doc.toObject();
  } catch (e) {
    // Convert Mongoose validation errors into 400 so frontend sees a "bad request" not 500.
    if (e?.name === 'ValidationError') {
      const err = new Error(e.message);
      err.status = 400;
      throw err;
    }
    throw e;
  }
};



/**
 * INTERNAL: materialize a product doc by applying base Defaults + Overrides (+ Extensions)
 * This is used by catalogs.controller.getCatalogProducts so the grid always has ProductDefinition.
 */
exports._materializeProductDoc = async (productDoc, opts = {}) => {
  const options = {
    includeBase: !!opts.includeBase,
    keepInheritanceFields: opts.keepInheritanceFields !== undefined ? !!opts.keepInheritanceFields : true,
  };

  if (!productDoc || typeof productDoc !== 'object') return productDoc;

  let base = null;
  if (productDoc.BaseProductID) {
    base = await ProductBase.findById(String(productDoc.BaseProductID)).lean();
  }

  const baseDefaults = base?.Defaults && typeof base.Defaults === 'object' ? base.Defaults : {};
  const overrides = productDoc.Overrides && typeof productDoc.Overrides === 'object' ? productDoc.Overrides : {};
  const extensions = productDoc.Extensions && typeof productDoc.Extensions === 'object' ? productDoc.Extensions : {};

  // Start with base defaults
  const resolved = deepClone(baseDefaults);

  // Apply overrides then extensions
  deepMerge(resolved, overrides);
  deepMerge(resolved, extensions);

  // Ensure ProductDefinition exists (fallback to legacy field)
  const legacyPD = productDoc.ProductDefinition && typeof productDoc.ProductDefinition === 'object'
    ? productDoc.ProductDefinition
    : null;

  if (!resolved.ProductDefinition && legacyPD) resolved.ProductDefinition = legacyPD;
  if (!resolved.ProductDefinition) resolved.ProductDefinition = { Name: String(productDoc._id || ''), ShortDescription: '', DescriptionHtml: '' };

  const out = {
    ...productDoc,
    ProductDefinition: resolved.ProductDefinition,
  };

  if (options.includeBase) out.BaseProduct = base || null;

  if (!options.keepInheritanceFields) {
    delete out.Overrides;
    delete out.Extensions;
  }

  return out;
};

function deepClone(obj) {
  try {
    return obj ? JSON.parse(JSON.stringify(obj)) : {};
  } catch {
    return obj && typeof obj === 'object' ? { ...obj } : {};
  }
}

function deepMerge(target, source) {
  if (!source || typeof source !== 'object') return target;
  if (!target || typeof target !== 'object') return target;

  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = target[key];

    if (Array.isArray(sv)) {
      // arrays: replace (simple + predictable)
      target[key] = sv.slice();
      continue;
    }

    if (sv && typeof sv === 'object') {
      if (!tv || typeof tv !== 'object' || Array.isArray(tv)) target[key] = {};
      deepMerge(target[key], sv);
      continue;
    }

    target[key] = sv;
  }

  return target;
}

function normalizeId(id) {
  const s = id != null ? String(id).trim() : '';
  return s.length ? s : null;
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
