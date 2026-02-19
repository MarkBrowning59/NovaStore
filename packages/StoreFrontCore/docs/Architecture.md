# StoreFront Product Architecture

## TL;DR
The system separates **templates**, **instances**, and **presentation** for long-term scalability.

---

## Core Concepts

| Concept        | Responsibility |
|---------------|----------------|
| Base Product  | Defaults & capabilities |
| Product       | Sellable instance |
| Catalog       | Navigation & ordering |

---

## High-Level Flow

```
BaseProduct
     ↓
 Product (inherits + overrides)
     ↓
 Catalog (orders & displays)
```

---

## Why This Architecture?

### Separation of Concerns
- Templates ≠ instances
- Data ≠ presentation
- Behavior ≠ ordering

### Scalability
- Add new products without duplication
- Change defaults safely
- Support many catalogs per product

### Flexibility
- Products can exist outside catalogs
- Catalogs can reorder freely
- Inheritance is optional

---

## Data Ownership

- Base Product owns defaults
- Product owns overrides & extensions
- Catalog owns ordering

No document duplicates another.

---

## Long-Term Benefits

- Clean migrations away from legacy systems
- Easier admin tooling
- Clear mental model for developers
- Safe experimentation with new product types
