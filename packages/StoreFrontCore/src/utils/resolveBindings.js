import { resolvePath } from "./resolvePath.js";

const SINGLE_BINDING_RE = /^\{\{\s*([^{}]+?)\s*\}\}$/;
const INLINE_BINDING_RE = /\{\{\s*([^{}]+?)\s*\}\}/g;

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function resolveString(value, context) {
  const single = value.match(SINGLE_BINDING_RE);
  if (single) {
    const resolved = resolvePath(context, single[1]);
    return resolved === undefined ? value : resolved;
  }

  return value.replace(INLINE_BINDING_RE, (_, path) => {
    const resolved = resolvePath(context, path);
    return resolved === undefined ? `{{${path}}}` : String(resolved);
  });
}

export function resolveBindings(input, context = {}) {
  if (Array.isArray(input)) return input.map((item) => resolveBindings(item, context));
  if (typeof input === "string") return resolveString(input, context);
  if (!isPlainObject(input)) return input;

  const out = {};
  for (const [key, value] of Object.entries(input)) {
    out[key] = resolveBindings(value, context);
  }
  return out;
}
