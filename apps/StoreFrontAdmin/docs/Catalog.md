# Catalog Document Reference

## TL;DR
A **Catalog** is an ordered container of Products.  
Catalogs control **navigation, hierarchy, and display order**, not product behavior.

---

## What is a Catalog?

A **Catalog** represents a logical grouping of Products used for:
- Navigation (breadcrumbs, sidebars)
- Display order
- Product discovery

Catalogs may be hierarchical (parent / child catalogs).

---

## Example Catalog Document

```json
{
  "_id": "XMPie3070",
  "name": "Apparel",
  "parentId": null,
  "DisplayOrder": 1,
  "StatusID": 1,
  "products": [
    { "_id": "694b1880fbbd1560636f9a63", "DisplayOrder": 1 },
    { "_id": "694b1880fbbd1560636f9a64", "DisplayOrder": 2 }
  ]
}
```

---

## Field Reference

### _id
- **Type:** string
- **Purpose:** Stable catalog identifier
- **Notes:** Used in routing and catalog-product relationships

---

### name
- **Type:** string
- **Purpose:** Display name in navigation and UI

---

### parentId
- **Type:** string | null
- **Purpose:** Enables hierarchical catalogs
- **Behavior:**
  - null = root catalog
  - value = child of another catalog

---

### DisplayOrder
- **Type:** number
- **Purpose:** Sort order among sibling catalogs

---

### StatusID
- **Type:** number
- **Purpose:** Lifecycle state
- **Common values:**
  - 1 = Active
  - 0 = Inactive
  - 3 = Archived

---

### products
- **Type:** array
- **Purpose:** Ordered list of products in this catalog

Each entry:
```json
{
  "_id": "productId",
  "DisplayOrder": 1
}
```

This array controls **exactly** what appears in the catalog grid and in what order.

---

## Important Design Notes

- Catalogs do **not** own product data
- Catalogs only reference products by `_id`
- Product membership metadata (`CatalogIds`) does not control ordering
- A product appears in a catalog **only if present in this list**

---

## Mental Model

- Catalog = ordered container
- Product = reusable entity
- DisplayOrder lives with the Catalog
