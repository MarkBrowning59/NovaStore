# Product Document Reference

## TL;DR
A Product is a sellable item that may optionally inherit defaults from a Base Product.
Catalog membership and display order are controlled by Catalog documents, not by the Product itself.

---

## What is a Product?

A **Product** represents a concrete, sellable item in the StoreFront system.
It may:
- Stand alone (no inheritance)
- Inherit defaults from a Base Product
- Override or extend inherited values
- Belong to one or more catalogs

Products are the primary unit used for:
- Display in storefronts
- Ordering and fulfillment
- Pricing and inventory rules
- Configuration and personalization

---

## Example Product Document

```json
{
  "_id": "694b1880fbbd1560636f9a63",
  "BaseProductID": null,
  "CatalogIds": ["XMPie3070"],
  "ProductDefinition": {
    "Name": "Imperial Phoenix Visor",
    "ShortDescription": "",
    "Description": ""
  },
  "ProductProfileIds": [],
  "productType": "STATIC_PRINT",
  "interactionType": "SIMPLE",
  "capabilities": {
    "isPhysical": true,
    "hasInventory": true,
    "allowsUpload": false,
    "usesVDPTemplate": false
  },
  "Overrides": {},
  "Extensions": {},
  "IDs": [
    {
      "System": "StoreFront",
      "ID": "694b1880fbbd1560636f9a63"
    }
  ]
}
```

---

## Field Reference

### _id
- **Type:** string
- **Source:** MongoDB-generated
- **Purpose:** Primary identifier for the product
- **Notes:** Never user-entered; used for routing, editing, and catalog membership

---

### BaseProductID
- **Type:** string | null
- **Purpose:** Links the product to a Base Product for inheritance
- **Behavior:**
  - null = no inheritance
  - value = inherit defaults from Base Product
- **Important:** Base Products are fetched dynamically and are not embedded

---

### CatalogIds
- **Type:** string[]
- **Purpose:** Indicates which catalogs the product belongs to
- **Notes:**
  - Metadata only
  - Does not control display order
  - Display order lives in the Catalog document

---

### ProductDefinition
User-facing descriptive fields.

Fields:
- Name (required)
- ShortDescription (optional)
- Description (optional, may contain HTML)

These values may be inherited and overridden.

---

### ProductProfileIds
- **Type:** string[]
- **Purpose:** Links to Product Profiles
- **Used for:**
  - Pricing logic
  - Fulfillment behavior
  - Variable data rules

---

### productType
- **Type:** enum
- **Examples:**
  - STATIC_PRINT
  - DYNAMIC_PRINT
  - DIGITAL
- **Purpose:** Defines the high-level product classification

---

### interactionType
- **Type:** enum
- **Examples:**
  - SIMPLE
  - CONFIGURABLE
  - UPLOAD
- **Purpose:** Controls how users interact with the product in the UI

---

### capabilities
Describes what the product can do.

Common fields:
- isPhysical
- hasInventory
- allowsUpload
- usesVDPTemplate

Usually inherited from a Base Product but may be overridden.

---

### Overrides
- **Type:** object
- **Purpose:** Explicitly replace inherited Base Product values
- **Behavior:** Only specified fields override the base

Example:
```json
{
  "ProductDefinition.Name": "Custom Override Name"
}
```

---

### Extensions
- **Type:** object
- **Purpose:** Add new behavior not defined by the Base Product
- **Examples:**
  - Store-specific metadata
  - One-off configuration
  - Experimental flags

Extensions never replace base values.

---

### IDs
- **Type:** array of { System, ID }
- **Purpose:** Cross-system identity mapping
- **Examples:** StoreFront, XMPie, Business Central

---

## Relationship to Catalogs

A product appears in a catalog only when:

1. The Product contains the catalog ID in `CatalogIds`
2. The Catalog document includes the product in its ordered list:
   ```js
   catalog.products[] = [{ _id, DisplayOrder }]
   ```

This separation allows:
- Independent catalog ordering
- Multi-catalog membership
- Clean catalog-specific display control

---

## Mental Model Summary

- Product = instance
- Base Product = template
- Catalog = ordered container
- Overrides = replace inherited values
- Extensions = additive behavior

This design provides strong inheritance, flexibility, and long-term scalability.
