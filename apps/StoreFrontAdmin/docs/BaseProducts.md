# Base Products (ProductBases)
Our discussions around product creation included the process of you creating an initial product and then Jess creating multiple products by copying it and then modifying that cloned product as needed. 

That process is at the heart of object orientated programming where you have a class and then many instances of that class. 

I have developed NovaStore product catalogs using that same methodology. Base products can be developed and then aditional products are created as instances of that product.

Below is a more detailed explanation as to how that's done. 

 

## TL;DR
- **Base Products** are reusable templates (think *classes*).
- **Products** inherit defaults from a Base Product (think *instances*).
- Bases store shared **ProductDefinition, capabilities, and config**.
- Products override only what’s different.
- Updating a Base updates all derived Products automatically.
- Products must belong to a catalog; Bases never do.

---

Base Products provide a reusable inheritance layer for Products in NovaStore.
They allow you to define shared defaults once and reuse them across many products.

---

## Why Base Products Exist

Without Base Products:
- Each Product duplicates descriptions, pricing rules, capabilities, and configs
- Changes must be repeated across many products
- Consistency is hard to enforce

With Base Products:
- Shared data lives in one place
- Products override only what is unique
- Changes to a Base automatically flow to derived products

---

## Core Concepts

### ProductBase
A ProductBase is a reusable template.

Characteristics:
- Not sellable
- Not assigned to catalogs
- Holds default values only
- Can be cloned or created from a Product

Stored in: productBases collection

---

### Product
A Product is a catalog item.

Characteristics:
- Must belong to at least one catalog (CatalogIds)
- May reference a ProductBase
- May override base values
- May add product-only extensions

Stored in: products collection

---

## Inheritance Model

When a Product is fetched, the backend materializes it:

Resolved Product =
  BaseProduct.Defaults
+ Product.Overrides
+ Product.Extensions

### Precedence Rules
1. Product Overrides win over Base Defaults
2. Base Defaults apply when no override exists
3. Extensions are product-only additions

The resolved object is what the UI displays.

---

## Data Structure

### ProductBase Example

{
  "_id": "PB_Apparel",
  "Name": "Custom Apparel Base",
  "Defaults": {
    "ProductDefinition": {
      "Name": "Custom Apparel",
      "ShortDescription": "",
      "DescriptionHtml": ""
    },
    "capabilities": {
      "purchasable": true,
      "inventory": { "track": false, "source": "none" },
      "personalization": { "enabled": true, "mode": "fields" }
    },
    "config": {
      "pricing": { "model": "tiers", "currency": "USD" },
      "variants": {
        "options": [
          { "name": "Size", "values": ["S", "M", "L"] }
        ]
      }
    }
  }
}

---

### Product Example

{
  "_id": "XMPie13347",
  "CatalogIds": ["XMPie3059"],
  "BaseProductId": "PB_Apparel",
  "Overrides": {
    "ProductDefinition": {
      "Name": "Port Authority Polo"
    }
  },
  "Extensions": {}
}

---

## Admin UI Behavior

### Product Edit Page
- Select a Base Product (a product can be created without a base)
- Fields show inherited or overridden values
- UI indicates inheritance vs override
- Resolved preview reflects final output

### Base Product Edit Page
- Edit shared Defaults only
- Changes affect all derived products
- No catalog assignment here

---

## Creating Base Products

### Create from Scratch
- Navigate to Base Products
- Create new Base
- Optionally start from a preset

### Clone a Base Product
- Copies all Defaults
- Generates a new ID
- Useful for template variants

### Create Base from Product
- Snapshots the current resolved product
- Copies ProductDefinition, capabilities, and config
- Creates a new Base Product

---

## Cloning Products

Products require at least one CatalogId.

When cloning:
- Defaults to the current catalog context
- Can specify catalogId(s)
- Backend enforces this rule

Example:

{
  "newId": "XMPie13347_Copy1",
  "newName": "Polo Shirt (Copy)",
  "catalogId": "XMPie3059"
}

---

## API Endpoints

### ProductBases
- GET /api/productBases
- GET /api/productBases/:id
- POST /api/productBases
- PATCH /api/productBases/:id
- POST /api/productBases/:id/clone
- DELETE /api/productBases/:id

### Products (Relevant)
- GET /api/products/:id
- PATCH /api/products/:id
- POST /api/products/:id/clone

---

## Best Practices

- Put shared data in Base Defaults
- Keep unique data in Product Overrides
- Avoid catalog logic in bases
- Prefer DescriptionHtml for descriptions
- Use cloning instead of copying JSON

---

## Mental Model

Think of ProductBases as classes.
Think of Products as instances.

Base = blueprint  
Product = concrete implementation
