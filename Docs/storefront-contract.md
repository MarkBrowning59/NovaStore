# Storefront Product Contract

## Endpoint
`GET /api/storefront/products/:id`

## Response Shape
```json
{
  "product": { /* ResolvedProduct */ },
  "template": { /* ProductTemplate */ }
}
```

This response is the rendering contract consumed by StoreFrontCore.

## ResolvedProduct
`ResolvedProduct` is a fully materialized product returned by the backend. Inheritance has already been resolved in this order:

1. Base defaults (`BaseProduct.Defaults`)
2. Product overrides (`Product.Overrides`)
3. Product extensions (`Product.Extensions`)

StoreFrontCore should treat `product` as final resolved data and should not re-apply inheritance.

### Required top-level fields
The storefront can rely on these fields being present in `product`:

- `_id` (string): canonical product id (string id; do not assume ObjectId).
- `IDs` (array): external/cross-system ids, each item:
  - `System` (string)
  - `ID` (string)
- `CatalogIds` (string[]): catalog membership.
- `ProductDefinition` (object): primary user-facing definition.

Template field:

- `templateKey` (string | null, optional): explicit template override at product level.

### User-facing definition and behavior fields
`ProductDefinition` is the primary source for display content and commonly includes:

- `Name`
- `ShortDescription`
- `DescriptionHtml`
- `Images`

Behavior and configuration are represented as:

- `capabilities` (object): behavior flags (for example upload, VDP, inventory behavior).
- `config` (object): product-specific configuration (pricing model, variants/options, personalization schema, etc.).

## ProductTemplate
`ProductTemplate` describes how StoreFrontCore renders the resolved product.

### Required fields
- `key` (string)
- `name` (string)
- `blocks` (array)

### Default flag
- `isDefault` (boolean, when applicable): marks the system default template.

### `blocks[]` shape
Each block entry uses:

```json
{ "id": "string", "type": "string", "props": {} }
```

- `id`: stable block instance id.
- `type`: renderer block type.
- `props`: block-specific config; may include bindings to resolved product paths.

Example binding-style prop:

```json
{ "title": { "$bind": "ProductDefinition.Name" } }
```


### Binding Convention (v1)

Bindings use an object with a `$bind` property:

```json
{ "$bind": "path.to.value" }


This locks Core behavior before someone invents token syntax later.

---

## 🔧 Adjustment 2 — Clarify that backend returns already-selected template

Right now it’s implied that backend selects template.

Make it explicit in Endpoint section:

Add:

```md
The backend is responsible for selecting the correct template using the defined precedence and returning it in the response. StoreFrontCore must not perform template selection.

## Template Selection Precedence
Template resolution must follow this exact order:

1. `product.templateKey`
2. `base.SchemaHints.defaultTemplateKey`
3. system default template (template where `isDefault = true`)

## Example A: Simple Product
```json
{
  "product": {
    "_id": "XMPie13347",
    "IDs": [
      { "System": "StoreFront", "ID": "XMPie13347" }
    ],
    "CatalogIds": ["XMPie3059"],
    "ProductDefinition": {
      "Name": "Standard Business Card",
      "ShortDescription": "14pt matte card stock",
      "DescriptionHtml": "<p>Full-color two-sided business card.</p>",
      "Images": [
        { "url": "https://cdn.example.com/products/XMPie13347/front.jpg" },
        { "url": "https://cdn.example.com/products/XMPie13347/back.jpg" }
      ]
    },
    "templateKey": "standard-product",
    "config": {
      "pricing": {
        "currency": "USD",
        "basePrice": 29.99
      }
    },
    "capabilities": {
      "isPhysical": true,
      "hasInventory": true
    }
  },
  "template": {
    "key": "standard-product",
    "name": "Standard Product",
    "isDefault": false,
    "blocks": [
      {
        "id": "hero",
        "type": "product.hero",
        "props": {
          "title": { "$bind": "ProductDefinition.Name" },
          "images": { "$bind": "ProductDefinition.Images" }
        }
      },
      {
        "id": "details",
        "type": "product.details",
        "props": {
          "html": { "$bind": "ProductDefinition.DescriptionHtml" }
        }
      },
      {
        "id": "price",
        "type": "product.price",
        "props": {
          "value": { "$bind": "config.pricing.basePrice" }
        }
      }
    ]
  }
}
```

## Example B: Configurable Product (Options/Variants)
```json
{
  "product": {
    "_id": "XMPie20001",
    "IDs": [
      { "System": "StoreFront", "ID": "XMPie20001" }
    ],
    "CatalogIds": ["XMPie3059"],
    "ProductDefinition": {
      "Name": "Performance Polo",
      "ShortDescription": "Moisture-wicking polo shirt",
      "DescriptionHtml": "<p>Select size and color before adding to cart.</p>",
      "Images": [
        { "url": "https://cdn.example.com/products/XMPie20001/main.jpg" }
      ]
    },
    "templateKey": null,
    "config": {
      "variants": {
        "options": [
          { "name": "Size", "values": ["S", "M", "L", "XL"] },
          { "name": "Color", "values": ["Black", "Navy", "White"] }
        ]
      },
      "pricing": {
        "currency": "USD",
        "basePrice": 24.0,
        "priceAdjustments": {
          "Size:XL": 2.0
        }
      }
    },
    "capabilities": {
      "isPhysical": true,
      "hasInventory": true
    }
  },
  "template": {
    "key": "apparel-config",
    "name": "Apparel Configurator",
    "isDefault": false,
    "blocks": [
      { "id": "hero", "type": "product.hero", "props": {} },
      {
        "id": "options",
        "type": "product.options",
        "props": {
          "options": { "$bind": "config.variants.options" }
        }
      },
      {
        "id": "price",
        "type": "product.price",
        "props": {
          "value": { "$bind": "config.pricing.basePrice" }
        }
      }
    ]
  }
}
```

## Example C: Personalized Product
```json
{
  "product": {
    "_id": "XMPie30077",
    "IDs": [
      { "System": "StoreFront", "ID": "XMPie30077" }
    ],
    "CatalogIds": ["XMPie4001"],
    "ProductDefinition": {
      "Name": "Personalized Name Badge",
      "ShortDescription": "Provide attendee details and upload logo",
      "DescriptionHtml": "<p>Personalize each badge before checkout.</p>",
      "Images": [
        { "url": "https://cdn.example.com/products/XMPie30077/main.jpg" }
      ]
    },
    "templateKey": "personalized-product",
    "config": {
      "personalization": {
        "fields": [
          { "key": "firstName", "label": "First Name", "type": "text", "required": true },
          { "key": "lastName", "label": "Last Name", "type": "text", "required": true },
          { "key": "title", "label": "Title", "type": "text", "required": false }
        ]
      },
      "artworkUpload": {
        "enabled": true,
        "acceptedFileTypes": ["pdf", "png", "jpg"],
        "maxFileSizeMb": 25
      }
    },
    "capabilities": {
      "allowsUpload": true,
      "usesVDPTemplate": true,
      "isPhysical": true
    }
  },
  "template": {
    "key": "personalized-product",
    "name": "Personalized Product",
    "isDefault": false,
    "blocks": [
      { "id": "hero", "type": "product.hero", "props": {} },
      {
        "id": "personalization-form",
        "type": "product.personalizationForm",
        "props": {
          "fields": { "$bind": "config.personalization.fields" }
        }
      },
      {
        "id": "artwork-upload",
        "type": "product.upload",
        "props": {
          "upload": { "$bind": "config.artworkUpload" }
        }
      }
    ]
  }
}
```
