// services/products.service.js
//
// Adds inheritance/materialization:
//   materialized = deepMerge(base.Defaults, product.Overrides, product.Extensions)
// Backward compatible:
//   If product has legacy direct fields (e.g., ProductDefinition) and no Overrides,
//   those are treated as implicit overrides.
//
// Uses Mongoose models:
//   - Product (existing)
//   - ProductBase (new model)
//
const Product = require('../models/Product');
const ProductBase = require('../models/ProductBase');

// Optional: if you already have product profiles logic elsewhere, keep it.
// const productProfilesService = require('./productProfiles.service');

function isPlainObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

/**
 * Deep merge with "replace arrays" semantics.
 * Later objects win.
 */
function deepMerge(...objs) {
  const out = {};
  for (const obj of objs) {
    if (!isPlainObject(obj)) continue;

    for (const [k, v] of Object.entries(obj)) {
      if (Array.isArray(v)) {
        out[k] = v.slice(); // replace arrays
      } else if (isPlainObject(v) && isPlainObject(out[k])) {
        out[k] = deepMerge(out[k], v);
      } else if (isPlainObject(v)) {
        out[k] = deepMerge(v);
      } else {
        out[k] = v;
      }
    }
  }
  return out;
}

/**
 * Pull any legacy top-level fields into implicit overrides for backward compatibility.
 * This prevents older product docs (with ProductDefinition stored directly) from losing data
 * when materialization is introduced.
 */
function buildImplicitOverridesFromLegacy(doc) {
  const implicit = {};

  // Most important for your UI today:
  if (doc.ProductDefinition && isPlainObject(doc.ProductDefinition)) {
    implicit.ProductDefinition = doc.ProductDefinition;
  }

  // If you later decide to move these into base defaults, you can add:
  // if (doc.config && isPlainObject(doc.config)) implicit.config = doc.config;
  // if (doc.capabilities && isPlainObject(doc.capabilities)) implicit.capabilities = doc.capabilities;

  return implicit;
}

/**
 * Materialize a product doc by inheriting from ProductBase.Defaults.
 *
 * Options:
 * - includeBase: include BaseProduct doc (handy for admin edit screens)
 * - keepInheritanceFields: keep Overrides/Extensions in output
 */
async function materializeProductDoc(productDoc, { includeBase = false, keepInheritanceFields = true } = {}) {
  if (!productDoc) return null;

  // Ensure plain JS object
  const doc = productDoc.toObject ? productDoc.toObject() : productDoc;

  let base = null;
  let baseDefaults = {};

  if (doc.BaseProductID) {
    base = await ProductBase.findById(String(doc.BaseProductID).trim()).lean();
    baseDefaults = base?.Defaults && isPlainObject(base.Defaults) ? base.Defaults : {};
  }

  const overrides = doc.Overrides && isPlainObject(doc.Overrides) ? doc.Overrides : {};
  const extensions = doc.Extensions && isPlainObject(doc.Extensions) ? doc.Extensions : {};

  // Backward compat: if Overrides is empty, treat legacy fields as implicit overrides
  const implicitOverrides =
    Object.keys(overrides).length === 0 ? buildImplicitOverridesFromLegacy(doc) : {};

  const materialized = deepMerge(baseDefaults, implicitOverrides, overrides, extensions);

  // Merge materialized fields onto product, but do NOT let materialized clobber core identity fields
  const identity = {
    _id: doc._id,
    IDs: doc.IDs,
    CatalogIds: doc.CatalogIds,
    ProductProfileIds: doc.ProductProfileIds,
    LocalOverrides: doc.LocalOverrides,
    productType: doc.productType,
    interactionType: doc.interactionType,
    capabilities: doc.capabilities,
    config: doc.config,
    BaseProductID: doc.BaseProductID ?? null,
    StatusID: doc.StatusID,
    DisplayOrder: doc.DisplayOrder,
  };

  // Keep other non-inheritance top-level fields too (future-proof)
  const passthrough = { ...doc };

  // Remove fields we’ll rebuild explicitly
  delete passthrough.Overrides;
  delete passthrough.Extensions;

  // Materialized output: core identity + original fields + materialized payload
  const result = {
    ...passthrough,
    ...identity,
    ...materialized,
  };

  if (keepInheritanceFields) {
    result.Overrides = doc.Overrides || {};
    result.Extensions = doc.Extensions || {};
  }

  if (includeBase) {
    result.BaseProduct = base || null;
  }

  return result;
}

// -------------------- Public service methods --------------------

/**
 * getProducts({ page, pageSize, system })
 * Matches controller usage.
 */
exports.getProducts = async ({ page = 1, pageSize = 10, system = 'XMPie' } = {}) => {
  page = Math.max(parseInt(page, 10) || 1, 1);
  pageSize = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 200);

  const filter =
    system && system !== 'ALL'
      ? { 'IDs.System': system }
      : {};

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort({ DisplayOrder: 1, '_id': 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Product.countDocuments(filter),
  ]);

  // Materialize list view too (so grids get ProductDefinition even if inherited)
  const materializedItems = await Promise.all(
    items.map((p) => materializeProductDoc(p, { includeBase: false, keepInheritanceFields: false }))
  );

  return { page, pageSize, total, items: materializedItems };
};

/**
 * getProductById(id)
 * Used by GET /api/products/:id controller.
 */
exports.getProductById = async (id) => {
  const key = (id != null ? String(id).trim() : '');
  if (!key) return null;

  // First: direct _id (string like XMPie19484)
  let product = await Product.findById(key);
  if (!product) {
    // Fallback: match any IDs.ID = provided id (e.g., "13347")
    product = await Product.findOne({ 'IDs.ID': key });
  }

  if (!product) return null;

  // Materialize and include base for edit screen
  return await materializeProductDoc(product, { includeBase: true, keepInheritanceFields: true });
};

/**
 * getBySystemId(system, id)
 * Used by GET /api/products/by-system?system=XMPie&id=13346
 */
exports.getBySystemId = async (system, id) => {
  const sys = system != null ? String(system).trim() : '';
  const key = id != null ? String(id).trim() : '';

  if (!sys || !key) return null;

  const product = await Product.findOne({
    IDs: { $elemMatch: { System: sys, ID: key } },
  });

  if (!product) return null;
  return await materializeProductDoc(product, { includeBase: true, keepInheritanceFields: true });
};

/**
 * createProduct(productPayload)
 */
exports.createProduct = async (payload) => {
  const doc = new Product(payload);
  await doc.save();

  // Return materialized so UI sees inherited ProductDefinition immediately
  return await materializeProductDoc(doc, { includeBase: true, keepInheritanceFields: true });
};

/**
 * updateProduct(id, patch)
 */
exports.updateProduct = async (id, patch) => {
  const key = (id != null ? String(id).trim() : '');
  if (!key) return null;

  if (patch && patch._id && String(patch._id).trim() !== key) {
    throw new Error('Cannot change _id of Product.');
  }
  if (patch) delete patch._id;

  const updated = await Product.findByIdAndUpdate(
    key,
    { $set: patch },
    { new: true }
  );

  if (!updated) return null;
  return await materializeProductDoc(updated, { includeBase: true, keepInheritanceFields: true });
};

/**
 * deleteProduct(id)
 */
exports.deleteProduct = async (id) => {
  const key = (id != null ? String(id).trim() : '');
  if (!key) return null;

  const deleted = await Product.findByIdAndDelete(key);
  if (!deleted) return null;

  return deleted.toObject();
};

/**
 * getProductWithProfiles(id)
 * Keep your existing behavior; just materialize first so profiles can layer on top.
 * If you already have product profiles service, plug it in here.
 */
exports.getProductWithProfiles = async (id) => {
  const materialized = await exports.getProductById(id);
  if (!materialized) return null;

  // If/when you apply profiles, do it after base materialization:
  // const profiles = await productProfilesService.getProfiles(materialized.ProductProfileIds);
  // const final = applyProfiles(materialized, profiles, materialized.LocalOverrides);
  // return final;

  return materialized;
};

// Optional export if you want to reuse elsewhere (catalog products, etc.)
exports._materializeProductDoc = materializeProductDoc;
exports._deepMerge = deepMerge;
