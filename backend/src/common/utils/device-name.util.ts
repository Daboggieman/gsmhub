/**
 * Shared device-name helpers for seeders.
 * Used by seed-phonedb.ts and seed-prices.ts so slug derivation stays identical.
 */

/** Clean "SM-S721J Galaxy S24 FE 5G TD-LTE JP 128GB SCG30" → "Galaxy S24 FE" */
export function cleanName(model: string): string {
  let s = model;
  s = s.replace(
    /\b(5G|4G|LTE|TD-LTE|FD-LTE|CDMA2000|CDMA|GSM|UMTS|HSPA\+?|Premium Edition|Standard Edition|Dual SIM|Single SIM|Tri SIM)\b/g,
    '',
  );
  s = s.replace(/\b(TD|FD)[- ]?LTE\b/g, '');
  s = s.replace(
    /\b(?:JP|CN|KR|TW|HK|IN|EU|US|NA|LA|BR|MX|AU|SA|RU|TR|GB|DE|FR|IT|ES|CA|SEA|MEA|UW|Global|China)\b/g,
    '',
  );
  s = s.replace(/\b\d+(?:\.\d+)?(?:GB|TB|MB)\b/g, '');
  // Drop "/ alias" suffixes — variants, e.g. "... TD-LTE US 128GB / SM-S931R4"
  s = s.replace(/\/.*$/, '');
  const isCode = (tok: string): boolean => {
    if (tok.length < 5) return false;
    if (!/^[A-Z0-9-]+$/.test(tok)) return false;
    const hasL = /[A-Z]/.test(tok);
    const hasD = /\d/.test(tok);
    return (hasL && hasD) || /^\d{6,}$/.test(tok);
  };
  const out = s
    .split(' ')
    .filter((t) => t && !isCode(t))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    // strip any trailing punctuation/separators left by token removal
    .replace(/([ -]+)$/, '');
  return out || model;
}
