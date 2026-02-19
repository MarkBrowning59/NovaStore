// routes/products.routes.js
const router = require('express').Router();
const productsController = require('../controllers/products.controller');
const { materializeProduct } = require('../services/productMaterializer');

// 🔹 List products
router.get('/products', productsController.getProducts);

// 🔹 Inventory route (this is what your frontend/Postman is calling)
// GET /api/products/:id/inventory
router.get('/products/:id/inventory', productsController.getProductInventory);

//Property Profile routes
router.get(
  '/products/:id/withProfiles',
  productsController.getProductWithProfiles
);

// 🔹 More specific routes MUST come before '/products/:id'

// Find by system/id:  GET /api/products/by-system?system=XMPie&id=13347
router.get('/products/by-system', productsController.getProductBySystemId);

// Bulk lookup by IDs: POST /api/products/by-ids
router.post('/products/by-ids', productsController.getProductsByIds);

// 🔹 Get a single product by Mongo _id / StoreFront id
// GET /api/products/:id
router.get('/products/:id', productsController.getProductById);

// 🔹 Create / update / delete
router.post('/products', productsController.createProduct);
router.patch('/products/:id', productsController.updateProduct);
router.delete('/products/:id', productsController.deleteProduct);

module.exports = router;
