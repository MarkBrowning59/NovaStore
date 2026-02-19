// repositories/productMongoRepository.js
const Product = require('../models/Product');

/**
 * Get a paged list of products.
 * If system === 'ALL' or not provided, no System filter is applied.
 * Otherwise, filter on IDs.System.
 */
exports.findPaged = (system, page, pageSize) => {
  const query =
    !system || system === 'ALL'
      ? {}
      : { 'IDs.System': system };

  return Product.find(query)
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean()
    .exec();
};

/**
 * Find a product by its _id (string).
 */
exports.findById = (id) => {
  return Product.findById(id).lean().exec();
};

/**
 * Find a product by an external system ID (e.g. XMPie, BC, SQL).
 * For XMPie:
 *  - match IDs.System + IDs.ID
 *  - OR match _id = `XMPie${externalId}`
 * For any other system:
 *  - match IDs.System + IDs.ID only.
 */
exports.findByExternalId = async (system, externalId) => {
  // Build an $or array of possible matches
  const or = [];

  // Always try IDs.System + IDs.ID
  or.push({
    'IDs.System': system,
    'IDs.ID': externalId,
  });

  // For XMPie, also try legacy _id patterns
  if (system === 'XMPie') {
    or.push({ _id: externalId });
    or.push({ _id: `XMPie${externalId}` });
  }

  const product = await Product.findOne({ $or: or }).lean().exec();
  return product || null;
};
/**
 * Find products by a list of IDs, with optional paging.
 */
exports.findByIds = (ids, page, pageSize) => {
  const query = { _id: { $in: ids } };

  let cursor = Product.find(query);

  if (page && pageSize) {
    cursor = cursor
      .skip((page - 1) * pageSize)
      .limit(pageSize);
  }

  return cursor.lean().exec();
};

/**
 * Insert a new product document.
 */
exports.insert = (productData) => {
  const product = new Product(productData);
  return product.save(); // returns the saved doc
};

/**
 * Update an existing product by _id.
 */
exports.updateById = (id, updated) => {
  return Product.findByIdAndUpdate(id, updated, { new: true })
    .lean()
    .exec();
};

/**
 * Delete a product by _id.
 */
exports.deleteById = (id) => {
  return Product.findByIdAndDelete(id)
    .lean()
    .exec();
};
