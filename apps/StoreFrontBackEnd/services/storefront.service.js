const productService = require('./products.service');
const { materializeProduct } = require('./productMaterializer');
const ProductTemplate = require('../models/ProductTemplate');
const novaMongoDBRepository = require('../Repositories/NovaMongoDBRepository');

function normalizeString(value) {
  const text = value != null ? String(value).trim() : '';
  return text || null;
}

function buildNotFoundError(message) {
  const err = new Error(message);
  err.status = 404;
  return err;
}

async function resolveTemplate(resolvedProduct, deps) {
  const productTemplateKey = normalizeString(resolvedProduct?.templateKey);
  const baseTemplateKey = normalizeString(
    resolvedProduct?.Base?.SchemaHints?.defaultTemplateKey
  );

  if (productTemplateKey) {
    const template = await deps.findTemplateByKey(productTemplateKey);
    if (template) return template;
  }

  if (baseTemplateKey) {
    const template = await deps.findTemplateByKey(baseTemplateKey);
    if (template) return template;
  }

  return await deps.findDefaultTemplate();
}

async function getStorefrontProductById(id, customDeps = {}) {
  const deps = {
    getProductById: productService.getProductById,
    getDb: () => novaMongoDBRepository.getMongoRepository(),
    materializeProduct,
    findTemplateByKey: async (key) => ProductTemplate.findOne({ key }).lean(),
    findDefaultTemplate: async () => ProductTemplate.findOne({ isDefault: true }).lean(),
    ...customDeps,
  };

  const productId = normalizeString(id);
  if (!productId) return null;

  const productDoc = await deps.getProductById(productId);
  if (!productDoc) return null;

  const resolvedProduct = await deps.materializeProduct(deps.getDb(), productDoc, {
    includeBase: true,
  });

  // Ensure explicit product-level templateKey is available for precedence rule #1.
  if (productDoc.templateKey !== undefined) {
    resolvedProduct.templateKey = productDoc.templateKey;
  }

  const template = await resolveTemplate(resolvedProduct, deps);
  if (!template) {
    throw buildNotFoundError(
      `No product template could be resolved for product '${productId}'.`
    );
  }

  delete resolvedProduct.Base;

  return {
    product: resolvedProduct,
    template,
  };
}

module.exports = {
  getStorefrontProductById,
};
