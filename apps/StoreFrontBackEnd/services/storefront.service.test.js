const test = require('node:test');
const assert = require('node:assert/strict');

const { getStorefrontProductById } = require('./storefront.service');

function makeDeps({
  productDoc,
  materializedProduct,
  templatesByKey = {},
  defaultTemplate = null,
} = {}) {
  return {
    getProductById: async () => productDoc || null,
    getDb: () => ({}),
    materializeProduct: async () => ({ ...(materializedProduct || {}) }),
    findTemplateByKey: async (key) => templatesByKey[key] || null,
    findDefaultTemplate: async () => defaultTemplate,
  };
}

test('selects product.templateKey before all other template sources', async () => {
  const result = await getStorefrontProductById(
    'XMPie100',
    makeDeps({
      productDoc: {
        _id: 'XMPie100',
        templateKey: 'product-template',
      },
      materializedProduct: {
        _id: 'XMPie100',
        Base: {
          SchemaHints: { defaultTemplateKey: 'base-template' },
        },
      },
      templatesByKey: {
        'product-template': { key: 'product-template', name: 'P', blocks: [] },
        'base-template': { key: 'base-template', name: 'B', blocks: [] },
      },
      defaultTemplate: { key: 'system-default', name: 'D', blocks: [], isDefault: true },
    })
  );

  assert.equal(result.template.key, 'product-template');
  assert.equal(result.product.templateKey, 'product-template');
  assert.equal(Object.prototype.hasOwnProperty.call(result.product, 'Base'), false);
});

test('selects base.SchemaHints.defaultTemplateKey when product.templateKey is empty', async () => {
  const result = await getStorefrontProductById(
    'XMPie101',
    makeDeps({
      productDoc: {
        _id: 'XMPie101',
        templateKey: null,
      },
      materializedProduct: {
        _id: 'XMPie101',
        Base: {
          SchemaHints: { defaultTemplateKey: 'base-template' },
        },
      },
      templatesByKey: {
        'base-template': { key: 'base-template', name: 'B', blocks: [] },
      },
      defaultTemplate: { key: 'system-default', name: 'D', blocks: [], isDefault: true },
    })
  );

  assert.equal(result.template.key, 'base-template');
});

test('selects system default template when no explicit template key resolves', async () => {
  const result = await getStorefrontProductById(
    'XMPie102',
    makeDeps({
      productDoc: {
        _id: 'XMPie102',
        templateKey: null,
      },
      materializedProduct: {
        _id: 'XMPie102',
        Base: {
          SchemaHints: {},
        },
      },
      templatesByKey: {},
      defaultTemplate: { key: 'system-default', name: 'D', blocks: [], isDefault: true },
    })
  );

  assert.equal(result.template.key, 'system-default');
  assert.equal(result.template.isDefault, true);
});

test('returns null when product does not exist', async () => {
  const result = await getStorefrontProductById(
    'XMPie404',
    makeDeps({
      productDoc: null,
    })
  );

  assert.equal(result, null);
});

test('throws 404 when no template can be resolved', async () => {
  await assert.rejects(
    () =>
      getStorefrontProductById(
        'XMPie103',
        makeDeps({
          productDoc: {
            _id: 'XMPie103',
            templateKey: null,
          },
          materializedProduct: {
            _id: 'XMPie103',
            Base: {
              SchemaHints: { defaultTemplateKey: null },
            },
          },
          templatesByKey: {},
          defaultTemplate: null,
        })
      ),
    (err) =>
      err &&
      err.status === 404 &&
      /No product template could be resolved/.test(err.message)
  );
});
