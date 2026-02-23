const router = require('express').Router();
const storefrontController = require('../controllers/storefront.controller');

router.get(
  '/storefront/products/:id',
  storefrontController.getStorefrontProductById
);

module.exports = router;
