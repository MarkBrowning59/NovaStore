export function resolvePath(source, path) {
  if (!source || typeof path !== "string" || !path.trim()) return undefined;

  const keys = path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .map((s) => s.trim())
    .filter(Boolean);

  let current = source;
  for (const key of keys) {
    if (current == null || !(key in Object(current))) return undefined;
    current = current[key];
  }
  return current;
}

