// repositories/catalogMongoRepository.js
const ProductCatalog = require('../models/ProductCatalog');

/**
 * Find catalogs by parentId:
 *  - If parentId is provided (and not null/'null'): { parentId }
 *  - Else: top-level catalogs: { parentId: { $exists: false } }
 */
exports.findByParent = async (parentId) => {
  let query;

  if (parentId && parentId !== 'null') {
    query = { parentId };
  } else {
    // top-level: no parentId field
    query = { parentId: { $exists: false } };
  }

  return ProductCatalog.find(query).lean().exec();
};

/**
 * Find a catalog by _id.
 */
exports.findById = (id) => {
  return ProductCatalog.findOne({ _id: id }).lean().exec();
};

/**
 * Create a new catalog.
 */
exports.create = (data) => {
  const catalog = new ProductCatalog(data);
  return catalog.save();
};

/**
 * Update a catalog by _id.
 */
exports.updateById = (id, updateData) => {
  return ProductCatalog.findOneAndUpdate({ _id: id }, updateData, {
    new: true,
  })
    .lean()
    .exec();
};
