/**
 * Device-class taxonomy shared by every ingest path (PhoneDB seed,
 * GSMArena scraper/sync, CSV catalog seed, admin create).
 *
 * DEVICE_TYPE_CATEGORY is the canonical Category-collection name each
 * DeviceType maps to — `category` is always derived from `type`, never
 * from the brand (brands live in the Brands collection).
 */

import { DeviceType } from '../types';

export const DEVICE_TYPE_CATEGORY: Record<DeviceType, string> = {
  [DeviceType.PHONE]: 'Smartphones',
  [DeviceType.TABLET]: 'Tablets',
  [DeviceType.SMARTWATCH]: 'Smartwatches',
  [DeviceType.LAPTOP]: 'Laptops',
  [DeviceType.ACCESSORY]: 'Earbuds & Audio',
  [DeviceType.OTHER]: 'Other',
};

/**
 * Best-effort type classification from a device name, for sources that
 * carry no explicit category (GSMArena listings mix phones, tablets and
 * watches in one list). Matches the way manufacturers name their lines:
 * Galaxy Tab / iPad / MatePad → tablet, Galaxy Watch / Watch GT →
 * smartwatch, Buds / Pods / FreeBuds → audio accessory. Anything else is
 * a phone. Not exhaustive — sources with an explicit category
 * (PhoneDB "Device Category", CSV `type` column) take precedence.
 */
export function classifyDeviceType(name: string): DeviceType {
  const n = (name || '').toLowerCase();
  if (/buds|pods\b|earbuds|earphones|headphones|headset/.test(n)) {
    return DeviceType.ACCESSORY;
  }
  if (/smartwatch|\bwatch\b/.test(n)) {
    return DeviceType.SMARTWATCH;
  }
  if (/tablet|\btab\b|\btab\s*\d|ipad|matepad|\bpad\b/.test(n)) {
    return DeviceType.TABLET;
  }
  return DeviceType.PHONE;
}
