/**
 * Parse a query-string limit/page/page-size safely.
 * Non-numeric, <= 0, or NaN input falls back to `fallback`; the result is
 * clamped to [1, max] so `?limit=abc` and `?limit=999999999` both fail safe.
 */
export function parsePositiveInt(
  raw: unknown,
  fallback: number,
  max = 50,
): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.floor(n), max);
}
