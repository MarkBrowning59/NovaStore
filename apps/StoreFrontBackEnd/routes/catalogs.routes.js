// routes/catalogs.routes.js
const router = require('express').Router();
const catalogsController = require('../controllers/catalogs.controller');

// List catalogs (with products populated), optional ?parentId=
router.get('/catalogs', catalogsController.getCatalogs);

// 🔍 Search catalogs by name and return full path info
router.get('/catalogs/search', catalogsController.searchCatalogPaths);

// Create a catalog
router.post('/catalogs', catalogsController.createCatalog);

// Update a catalog (body contains _id and fields to change)
router.patch('/catalogs', catalogsController.updateCatalog);

// More specific route MUST come before '/catalogs/:id'
router.get('/catalogs/:id/products', catalogsController.getCatalogProducts);

// Get a single catalog by id (with products populated)
router.get('/catalogs/:id', catalogsController.getCatalogById);

// Update a catalog by id (REST style)
router.patch('/catalogs/:id', catalogsController.updateCatalogById);

router.post( '/catalogs/:id/products', catalogsController.addCatalogProduct);
module.exports = router;
