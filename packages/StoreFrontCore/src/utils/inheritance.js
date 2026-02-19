// src/utils/inheritance.js
// Helpers for inheritance-aware editing: base defaults + overrides + extensions -> resolved view.

export function isPlainObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

/**
 * Deep merge with "replace arrays" semantics.
 * Later objects win.
 */
export function deepMerge(...objs) {
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

export function getByPath(obj, path, fallback) {
  if (!path) return obj ?? fallback;
  const parts = Array.isArray(path) ? path : String(path).split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return fallback;
    cur = cur[p];
  }
  return cur === undefined ? fallback : cur;
}

export function hasByPath(obj, path) {
  if (!path) return obj !== undefined;
  const parts = Array.isArray(path) ? path : String(path).split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null || !Object.prototype.hasOwnProperty.call(cur, p)) return false;
    cur = cur[p];
  }
  return true;
}

export function setByPath(obj, path, value) {
  const parts = Array.isArray(path) ? path : String(path).split(".");
  const root = isPlainObject(obj) ? { ...obj } : {};
  let cur = root;
  for (let i = 0; i < parts.length; i++) {
    const key = parts[i];
    const last = i === parts.length - 1;
    const existing = cur[key];

    if (last) {
      cur[key] = value;
    } else {
      cur[key] = isPlainObject(existing) ? { ...existing } : {};
      cur = cur[key];
    }
  }
  return root;
}

export function deleteByPath(obj, path) {
  if (!isPlainObject(obj)) return {};
  const parts = Array.isArray(path) ? path : String(path).split(".");
  const root = { ...obj };
  let cur = root;

  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!isPlainObject(cur[key])) return root;
    cur[key] = { ...cur[key] };
    cur = cur[key];
  }

  delete cur[parts[parts.length - 1]];
  return root;
}
