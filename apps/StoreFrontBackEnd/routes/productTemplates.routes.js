// routes/productTemplates.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/productTemplates.controller');

// GET /api/product-templates
router.get('/product-templates', ctrl.listProductTemplates);

// GET /api/product-templates/:key
router.get('/product-templates/:key', ctrl.getProductTemplateByKey);

// POST /api/product-templates
router.post('/product-templates', ctrl.createProductTemplate);

// PATCH /api/product-templates/:key
router.patch('/product-templates/:key', ctrl.updateProductTemplateByKey);

// DELETE /api/product-templates/:key
router.delete('/product-templates/:key', ctrl.deleteProductTemplateByKey);

// POST /api/product-templates/:key/clone
router.post('/product-templates/:key/clone', ctrl.cloneProductTemplateByKey);

module.exports = router;
