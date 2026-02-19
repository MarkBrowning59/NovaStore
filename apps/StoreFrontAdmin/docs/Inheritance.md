# Product Inheritance & Materialization

## TL;DR
Inheritance is resolved **at runtime** by merging:
Base Product Defaults → Product Overrides → Product Extensions

Nothing is permanently copied.

---

## Inheritance Flow

When a Product is loaded:

1. Load Product document
2. If `BaseProductID` exists:
   - Load Base Product
   - Apply Defaults
3. Apply Product Overrides
4. Apply Product Extensions
5. Return the merged result to the UI

---

## Merge Priority (Lowest → Highest)

```
BaseProduct.Defaults
→ Product.Overrides
→ Product.Extensions
```

Later layers always win.

---

## Overrides vs Extensions

### Overrides
- Replace inherited values
- Must be explicitly allowed (AllowedOverrides)
- Intended for differences from the base

### Extensions
- Add new data
- Never overwrite base defaults
- Used for product-specific behavior

---

## Example

Base Defaults:
```json
{
  "capabilities": { "hasInventory": true }
}
```

Product Overrides:
```json
{
  "capabilities.hasInventory": false
}
```

Final Result:
```json
{
  "capabilities": { "hasInventory": false }
}
```

---

## Standalone Products

If `BaseProductID = null`:
- No inheritance occurs
- Product fields are the source of truth
- Overrides are ignored

---

## Why This Design Works

- No data duplication
- Easy base updates
- Clear override intent
- Safe experimentation

---

## UI Implications

- Inherited fields are visually marked
- Overrides are editable
- Extensions are additive
