// Utility to ensure posts is always an array
export function ensureArray(val) {
  if (Array.isArray(val)) return val;
  if (val == null) return [];
  if (typeof val === 'object') return Object.values(val);
  return [];
}
