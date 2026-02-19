// services/catalogs.service.js
const catalogRepo = require('../repositories/catalogMongoRepository');
const Product = require('../models/Product');

/**
 * Helper: Given a catalog doc, populate its products array with ProductDefinition.
 *
 * catalog.products is expected to look like:
 *  [
 *    { _id: 'XMPie19484', DisplayOrder: 2 },
 *    ...
 *  ]
 *
 * We return:
 *  {
 *    ...catalog,
 *    products: [
 *      { _id, DisplayOrder, ProductDefinition: { Name, ShortDescription, Description } | null }
 *    ]
 *  }
 */
async function populateCatalogProducts(catalog) {
  const entries = Array.isArray(catalog.products) ? catalog.products : [];
  if (!entries.length) {
    return { ...catalog, products: [] };
  }

  const ids = entries.map((p) => p._id).filter(Boolean);

  // Fetch only ProductDefinition (like the old route did)
  const products = await Product.find(
    { _id: { $in: ids } },
    { ProductDefinition: 1 }
  )
    .lean()
    .exec();

  const map = new Map();
  products.forEach((p) => map.set(p._id, p));

  const populatedProducts = entries.map((entry) => {
    const full = map.get(entry._id);
    return {
      _id: entry._id,
      DisplayOrder: entry.DisplayOrder,
      ProductDefinition: full ? full.ProductDefinition : null,
    };
  });

  return {
    ...catalog,
    products: populatedProducts,
  };
}

/**
 * Get catalogs by parentId (or top-level), with populated products.
 * Returns { catalogs, totalCount } to match old behavior.
 */
exports.getCatalogsWithProducts = async (parentId) => {
  const catalogs = await catalogRepo.findByParent(parentId);
  const populated = await Promise.all(
    catalogs.map((cat) => populateCatalogProducts(cat))
  );

  return {
    catalogs: populated,
    totalCount: populated.length,
  };
};

/**
 * Get a single catalog by id, with products populated.
 */
exports.getCatalogByIdWithProducts = async (id) => {
  const catalog = await catalogRepo.findById(id);
  if (!catalog) return null;
  return populateCatalogProducts(catalog);
};

/**
 * Create a new catalog.
 */
exports.createCatalog = async (data) => {
  const created = await catalogRepo.create(data);
  // Old code returned raw new catalog, no population
  return created;
};

/**
 * Update a catalog.
 * Expects payload with _id and fields to update.
 */
exports.updateCatalog = async (payload) => {
  const { _id, ...updateData } = payload;

  if (!_id) {
    const err = new Error('Missing _id for catalog update');
    err.status = 400;
    throw err;
  }

  const updated = await catalogRepo.updateById(_id, updateData);
  return updated;
};

/**
 * Get products for a single catalog by id.
 * Returns:
 *   - null if catalog not found
 *   - array of { _id, DisplayOrder, ProductDefinition } if found
 */
exports.getCatalogProducts = async (catalogId) => {
  const catalog = await catalogRepo.findById(catalogId);
  if (!catalog) return null;

  const populated = await populateCatalogProducts(catalog);
  return populated.products || [];
};
