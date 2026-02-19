// Simple deep merge where later objects overwrite earlier ones.
// Arrays are replaced (not concatenated) to avoid weird media/options blends.
function isPlainObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

function deepMerge(...objs) {
  const out = {};
  for (const obj of objs) {
    if (!isPlainObject(obj)) continue;
    for (const [k, v] of Object.entries(obj)) {
      if (Array.isArray(v)) {
        out[k] = v.slice();
      } else if (isPlainObject(v) && isPlainObject(out[k])) {
        out[k] = deepMerge(out[k], v);
      } else if (isPlainObject(v)) {
        out[k] = deepMerge(v);
      } else {
        out[k] = v;
      }
    }
  }
  return out;
}

async function materializeProduct(db, productDoc, { includeBase = false } = {}) {
  if (!productDoc) return null;

  let baseDoc = null;
  if (productDoc.BaseProductID) {
    baseDoc = await db.collection('productBases').findOne({ _id: productDoc.BaseProductID });
  }

  const baseDefaults = baseDoc?.Defaults || {};
  const overrides = productDoc.Overrides || {};
  const extensions = productDoc.Extensions || {};

  const merged = deepMerge(baseDefaults, overrides, extensions);

  // Return “materialized” shape + keep some identity fields at top level
  const result = {
    _id: productDoc._id,
    IDs: productDoc.IDs,
    System: productDoc.System,
    StatusID: productDoc.StatusID,
    DisplayOrder: productDoc.DisplayOrder,
    BaseProductID: productDoc.BaseProductID,
    ...merged
  };

  if (includeBase) {
    result.Base = baseDoc; // useful for admin editors
  }

  return result;
}

module.exports = { deepMerge, materializeProduct };
