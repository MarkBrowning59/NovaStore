# Base Product Document Reference

## TL;DR
A **Base Product** is a reusable template that defines default values and capabilities
for Products. Products may inherit from a Base Product and selectively override or
extend its behavior.

---

## What is a Base Product?

A **Base Product** represents a **product template**.
It is never sold directly and never appears in a catalog.

Base Products exist to:
- Eliminate duplication across similar products
- Define standard capabilities and defaults
- Provide consistent behavior across product families
- Serve as a foundation for inheritance

Products reference a Base Product using `BaseProductID`.

---

## Key Characteristics

- Base Products:
  - ❌ Are not sellable
  - ❌ Do not belong to catalogs
  - ❌ Do not have pricing or inventory
  - ✅ Define defaults and capabilities
  - ✅ Can be cloned and reused

- Products:
  - ✅ Are sellable
  - ✅ Belong to catalogs
  - ✅ May inherit from a Base Product
  - ✅ May override or extend defaults

---

## Example Base Product Document

```json
{
  "_id": "PB_Apparel",
  "Name": "Apparel",
  "Description": "Base template for apparel products",
  "Defaults": {
    "ProductDefinition": {
      "ShortDescription": "",
      "Description": ""
    },
    "productType": "STATIC_PRINT",
    "interactionType": "SIMPLE",
    "capabilities": {
      "isPhysical": true,
      "hasInventory": true,
      "allowsUpload": false,
      "usesVDPTemplate": false
    }
  },
  "AllowedOverrides": [
    "ProductDefinition.Name",
    "ProductDefinition.ShortDescription",
    "ProductDefinition.Description",
    "capabilities.hasInventory"
  ],
  "Metadata": {
    "category": "Apparel"
  }
}
```

---

## Field Reference

### _id
- **Type:** string
- **Purpose:** Stable identifier referenced by Products as `BaseProductID`
- **Examples:** `PB_Apparel`, `PB_Signs`, `PB_Digital`

---

### Name
- **Type:** string
- **Purpose:** Human-readable name shown in admin UI
- **Notes:** Used for selection and clarity, not inheritance

---

### Description
- **Type:** string
- **Purpose:** Explains the intent and usage of the Base Product
- **Audience:** Admins / developers

---

### Defaults
- **Type:** object
- **Purpose:** Defines default values inherited by Products
- **Common sections:**
  - `ProductDefinition`
  - `productType`
  - `interactionType`
  - `capabilities`

Defaults are **merged into Products at runtime**, not copied.

---

### AllowedOverrides
- **Type:** string[]
- **Purpose:** Explicitly defines which fields Products are allowed to override
- **Behavior:**
  - Prevents accidental or invalid overrides
  - Enforced by UI and/or backend validation

Example:
```json
[
  "ProductDefinition.Name",
  "capabilities.hasInventory"
]
```

---

### Metadata
- **Type:** object
- **Purpose:** Optional classification or grouping data
- **Examples:**
  - category
  - product family
  - reporting tags

Metadata is **not inherited** by Products unless explicitly copied.

---

## Inheritance Behavior

When a Product references a Base Product:

1. Base `Defaults` are loaded
2. Product `Overrides` are applied on top
3. Product `Extensions` are merged last

Priority order (lowest → highest):

```
BaseProduct.Defaults
→ Product.Overrides
→ Product.Extensions
```

If `BaseProductID` is `null`, the Product behaves as standalone.

---

## What Base Products Should Contain

✅ Capabilities  
✅ Product type defaults  
✅ Interaction rules  
✅ Common descriptions or copy  

❌ Pricing  
❌ Inventory  
❌ Catalog membership  
❌ Product-specific content  

---

## When to Create a Base Product (Decision Checklist)

Create a Base Product when:
- Multiple products share the same behavior
- Capabilities are identical across a product family
- You want consistent defaults across many products
- You expect new products of the same type in the future

Do NOT create a Base Product when:
- The product is truly unique
- Only one instance will ever exist
- Inheritance adds more complexity than value

---

## Mental Model Summary

- Base Product = template
- Product = instance
- Defaults = inherited values
- Overrides = replacements
- Extensions = additions

This separation keeps the system flexible, maintainable, and scalable.
