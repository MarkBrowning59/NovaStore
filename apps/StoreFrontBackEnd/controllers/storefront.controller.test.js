const test = require('node:test');
const assert = require('node:assert/strict');

const storefrontService = require('../services/storefront.service');
const controller = require('./storefront.controller');

function createRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test('returns 404 when product is not found', async () => {
  const original = storefrontService.getStorefrontProductById;
  storefrontService.getStorefrontProductById = async () => null;

  const req = { params: { id: 'MissingProduct' } };
  const res = createRes();

  try {
    await controller.getStorefrontProductById(req, res);
    assert.equal(res.statusCode, 404);
    assert.deepEqual(res.body, { message: 'Product not found.' });
  } finally {
    storefrontService.getStorefrontProductById = original;
  }
});
