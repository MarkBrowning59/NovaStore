// routes/productBases.routes.js
const router = require('express').Router();
const productBasesController = require('../controllers/productBases.controller');

// 🔹 List base products
router.get('/productBases', productBasesController.getProductBases);

// 🔹 Get a single base product
router.get('/productBases/:id', productBasesController.getProductBaseById);

// 🔹 Create
router.post('/productBases', productBasesController.createProductBase);


// 🔹 Clone
router.post('/productBases/:id/clone', productBasesController.cloneProductBase);

// 🔹 Update
router.patch('/productBases/:id', productBasesController.updateProductBase);

// 🔹 Delete
router.delete('/productBases/:id', productBasesController.deleteProductBase);

module.exports = router;
