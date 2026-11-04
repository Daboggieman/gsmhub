/**
 * Derive the filterable numeric spec fields (ramValue, storageValue,
 * batteryValue, displaySizeValue) from the human-readable spec strings
 * stored on a device. Used at every ingest path (seeds, external-API
 * transformers, admin create/update) so min/max filters can match.
 */

export interface DeviceSpecValues {
  ramValue?: number;
  storageValue?: number;
  batteryValue?: number;
  displaySizeValue?: number;
}

/** "8GB RAM" → 8, "1TB" → 1024, "512MB" → 0.5, "5000 mAh" → 5000, '6.67"' → 6.67 */
export function extractSpecNumber(raw?: string | null): number | undefined {
  if (!raw) return undefined;
  const m = String(raw).match(
    /(\d+(?:[.,]\d+)?)\s*(TB|TIB|GB|GIB|MB|MIB|KB|KIB|MAH|INCH(?:ES)?|"|″)?/i,
  );
  if (!m) return undefined;
  const n = parseFloat(m[1].replace(",", "."));
  if (!Number.isFinite(n)) return undefined;
  const unit = (m[2] || "").toUpperCase();
  if (unit === "TB" || unit === "TIB") return n * 1024;
  if (unit === "MB" || unit === "MIB") return n / 1024;
  if (unit === "KB" || unit === "KIB") return n / (1024 * 1024);
  return n;
}

/** Derive all four numeric fields from the display strings; unset ones are omitted. */
export function deriveSpecValues(input: {
  ram?: string | null;
  storage?: string | null;
  battery?: string | null;
  displaySize?: string | null;
}): DeviceSpecValues {
  const out: DeviceSpecValues = {};
  const ram = extractSpecNumber(input.ram);
  if (ram !== undefined) out.ramValue = ram;
  const storage = extractSpecNumber(input.storage);
  if (storage !== undefined) out.storageValue = storage;
  const battery = extractSpecNumber(input.battery);
  if (battery !== undefined) out.batteryValue = battery;
  const display = extractSpecNumber(input.displaySize);
  if (display !== undefined) out.displaySizeValue = display;
  return out;
}
