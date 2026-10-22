/**
 * Backfill price history from the PhoneDB 25K dataset.
 *
 * The device seeder excluded the "Price" spec (NOISE_KEYS), so seeded devices
 * have no prices. The dataset stores an MSRP ("Gross end user price
 * recommended by the manufacturer on the day of product release") plus a
 * currency spec under the literal key "null" (e.g. "\nCNY", "\nUSD").
 *
 * This script re-reads the dataset, converts every MSRP to USD with fixed
 * approximate FX rates (the app renders latestPrice with a hardcoded "$"),
 * and inserts one PriceHistory row per device, dated at the device's
 * announced/released date.
 *
 * Match strategy: same as the device seeder — (brand, cleanName(model)) →
 * device slug. Devices whose slug is absent (non-smartphone categories that
 * were skipped, or unmapped names) are counted and skipped.
 *
 * Run:  pnpm exec ts-node src/seed-prices.ts
 * Env:
 *   DRY_RUN=1        report match stats without writing
 *   PHONEDB_JSON=path  dataset location
 *   SKIP_DANGLING_CLEANUP=1  keep the old dangling price rows
 */
import { connect, disconnect } from 'mongoose';
import { config } from 'dotenv';
import { PriceHistorySchema } from './modules/prices/price-history.schema';
import { DeviceSchema } from './modules/devices/device.schema';
import { generateSlug } from './common/utils/slug.util';
import { cleanName } from './common/utils/device-name.util';

import * as mongoose from 'mongoose';
import * as fs from 'fs';

config();

const DATASET_PATH =
  process.env.PHONEDB_JSON ||
  '/home/recoding/gsmhub/.seeddata/PhoneSpecsDataset25K.json';
const DRY_RUN = process.env.DRY_RUN === '1';
const CLEAN_DANGLING = process.env.SKIP_DANGLING_CLEANUP !== '1';

// FX rates to USD — approximate launch-date rates, fixed on purpose: these
// are MSRPs for display/filtering, not live market data.
const TO_USD: Record<string, number> = {
  USD: 1,
  CNY: 0.14,
  INR: 0.012,
  EUR: 1.08,
  JPY: 0.0067,
  GBP: 1.27,
  MXN: 0.055,
  CAD: 0.74,
  TWD: 0.031,
  AUD: 0.66,
  KRW: 0.00073,
  IDR: 0.000062,
  MYR: 0.21,
  RUB: 0.011,
  BRL: 0.18,
  THB: 0.028,
  AED: 0.27,
  HKD: 0.128,
  SGD: 0.74,
  VND: 0.00004,
  KZT: 0.0021,
  PLN: 0.25,
  TRY: 0.031,
  HUF: 0.0028,
  CHF: 1.12,
  SEK: 0.095,
  NOK: 0.095,
  DKK: 0.145,
  PHP: 0.018,
  PKR: 0.0036,
  NGN: 0.00065,
  EGP: 0.021,
  SAR: 0.267,
  QAR: 0.275,
  KWD: 3.26,
  JOD: 1.41,
  ILS: 0.27,
  ZAR: 0.055,
  UAH: 0.024,
  CZK: 0.043,
  RON: 0.22,
  BGN: 0.55,
  NZD: 0.61,
  BDT: 0.0086,
  LKR: 0.003,
  NPR: 0.0075,
  BND: 0.74,
  AMD: 0.0026,
  GEL: 0.37,
  AZN: 0.59,
  BYN: 0.31,
  MDL: 0.056,
  RSD: 0.0092,
  ISK: 0.0073,
};

interface RawRecord {
  title: string;
  url: string;
  img: string;
  specs: Record<string, { key: string; value: string | null } | null>;
}

/** Read a spec value; null, empty and bare ":" → '' */
function v(sp: RawRecord['specs'], key: string): string {
  const entry = sp[key];
  if (!entry || entry.value === null || entry.value === undefined) return '';
  const s = String(entry.value).trim();
  return s === ':' || /^\s*$/.test(s) ? '' : s;
}

// PhoneDB's currency spec lives under the literal key "null", and both the
// label and the Market Countries field carry noise (KR phones labelled TWD,
// Indonesian prices on "India"-market records, RUB on China-market rows…).
// Instead of trusting either blindly, resolvePrice() checks the raw number
// against the typical MSRP range of each candidate currency: the label wins
// when it fits; a single-market record may reinterpret via its country.
const COUNTRY_CURRENCY: Record<string, string> = {
  'South Korea': 'KRW',
  India: 'INR',
  Indonesia: 'IDR',
  Japan: 'JPY',
  Taiwan: 'TWD',
  China: 'CNY',
  Vietnam: 'VND',
  Russia: 'RUB',
  Brazil: 'BRL',
};

// Plausible MSRP range per currency in native units (launch prices).
const NATIVE_BAND: Record<string, [number, number]> = {
  USD: [30, 6000],
  EUR: [50, 3500],
  GBP: [40, 3000],
  CAD: [40, 4000],
  AUD: [40, 4000],
  CNY: [300, 20000],
  JPY: [5000, 400000],
  KRW: [50000, 3000000],
  INR: [3000, 200000],
  IDR: [100000, 30000000],
  TWD: [2000, 70000],
  VND: [1000000, 60000000],
  RUB: [2000, 250000],
  BRL: [200, 20000],
  MXN: [500, 40000],
  THB: [500, 60000],
  MYR: [200, 10000],
  PHP: [500, 80000],
  HKD: [300, 15000],
  SGD: [50, 4000],
  SAR: [100, 6000],
  AED: [200, 10000],
  KZT: [20000, 900000],
  CLP: [30000, 2000000],
  COP: [100000, 10000000],
  PEN: [100, 8000],
  QAR: [100, 8000],
  KWD: [10, 2000],
  JOD: [30, 3000],
  ILS: [100, 8000],
  ZAR: [300, 40000],
  PKR: [5000, 600000],
  BDT: [3000, 300000],
  NGN: [20000, 2000000],
  EGP: [1000, 100000],
  PLN: [200, 10000],
  TRY: [1000, 100000],
  HUF: [20000, 1500000],
  CHF: [50, 4000],
  SEK: [500, 30000],
  NOK: [500, 40000],
  DKK: [100, 10000],
  NZD: [50, 5000],
  RON: [200, 12000],
  CZK: [1000, 100000],
};

function extractCurrency(sp: RawRecord['specs']): string {
  const raw = v(sp, 'null').toUpperCase();
  const m = raw.match(/([A-Z]{3})/);
  return m ? m[1] : '';
}

/**
 * Decide this record's currency + USD price: interpret the raw value with
 * the labelled currency if that lands in the currency's MSRP band; else,
 * for single-market records, with the market country's currency; else null.
 */
function resolvePrice(
  sp: RawRecord['specs'],
): { usd: number; currency: string; original: number } | null {
  const raw = extractPrice(sp);
  if (raw === null) return null;
  const label = extractCurrency(sp);

  const tryCurrency = (cur: string): number | null => {
    const band = NATIVE_BAND[cur];
    const rate = TO_USD[cur];
    if (!band || !rate) return null;
    if (raw < band[0] || raw > band[1]) return null;
    return Math.round(raw * rate * 100) / 100;
  };

  const viaLabel = tryCurrency(label);
  if (viaLabel !== null) {
    return { usd: viaLabel, currency: label, original: raw };
  }

  const markets = (sp['Market Countries']?.value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (markets.length === 1) {
    const alt = COUNTRY_CURRENCY[markets[0]];
    if (alt && alt !== label) {
      const viaAlt = tryCurrency(alt);
      if (viaAlt !== null) {
        return { usd: viaAlt, currency: alt, original: raw };
      }
    }
  }
  return null;
}

function extractPrice(sp: RawRecord['specs']): number | null {
  const raw = v(sp, 'Price');
  if (!raw) return null;
  const n = Number(raw.replace(/,/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** "2025 May 22" | "2025 May" → Date (fallback: epoch at announce year) */
function parseDate(raw: string): Date {
  const m = raw.match(/^(\d{4})\s+([A-Za-z]{3})(?:\s+(\d{1,2}))?/);
  if (!m) return new Date(0);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const mi = months.indexOf(m[2]);
  if (mi < 0) return new Date(0);
  const d = m[3] ? Number(m[3]) : 1;
  return new Date(Date.UTC(Number(m[1]), mi, d));
}

async function main() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) throw new Error('MONGO_URI is not set');

  console.log(`Loading ${DATASET_PATH}...`);
  const dataset = JSON.parse(fs.readFileSync(DATASET_PATH, 'utf-8')) as RawRecord[];
  console.log(`Loaded ${dataset.length} records`);

  await connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const DeviceModel = mongoose.model('Device', DeviceSchema as any);
  const PriceHistoryModel = mongoose.model('PriceHistory', PriceHistorySchema as any);

  // --- 1. optionally remove the stale dangling demo rows ----------------
  if (CLEAN_DANGLING && !DRY_RUN) {
    const deviceIds = new Set(
      (await DeviceModel.find({}, { _id: 1 }).lean()).map((d: any) => d._id.toString()),
    );
    const all = await PriceHistoryModel.find({}, { device: 1 }).lean();
    const dangling = all.filter((p) => !deviceIds.has((p.device as any)?.toString()));
    if (dangling.length) {
      await PriceHistoryModel.deleteMany({ _id: { $in: dangling.map((d) => d._id) } });
      console.log(`Removed ${dangling.length} dangling price rows`);
    } else {
      console.log('No dangling price rows');
    }
  }

  // --- 2. build dataset price map: slug → candidate prices -------------
  // Currency labels in the dataset are noisy, so resolvePrice() sanity-checks
  // each record's raw value against native MSRP bands before converting;
  // clustering below then picks the majority interpretation per slug.
  console.log('Mapping dataset prices...');
  interface PriceEntry {
    price: number; // USD
    currency: string; // original launch currency
    originalPrice: number;
    date: Date;
  }
  const bySlug = new Map<string, PriceEntry[]>();
  let unresolved = 0;

  for (const rec of dataset) {
    const sp = rec.specs;
    if (!extractPrice(sp)) continue; // no price spec at all
    const resolved = resolvePrice(sp);
    if (!resolved) {
      unresolved++;
      continue;
    }

    const brand = v(sp, 'Brand') || 'Unknown';
    const model = v(sp, 'Model') || rec.title;
    const name = cleanName(model);
    if (!name) continue;

    const slug = generateSlug(`${brand} ${name}`);
    const date = parseDate(v(sp, 'Announced') || v(sp, 'Released'));

    const list = bySlug.get(slug) ?? [];
    list.push({
      price: resolved.usd,
      currency: resolved.currency,
      originalPrice: resolved.original,
      date,
    });
    bySlug.set(slug, list);
  }

  // --- 2b. pick a plausible price per slug ------------------------------
  // Keep candidates within the USD band, rescuing ones off by a power of
  // ten; then cluster and pick the largest cluster's median.
  const PRICE_MIN = 25;
  const PRICE_MAX = 25000;
  const finalBySlug = new Map<string, PriceEntry>();
  let rescaled = 0;
  let dropped = 0;

  for (const [slug, candidates] of bySlug) {
    // Rescue entries that are off by a power of ten (dataset sometimes
    // drops trailing zeros, e.g. IDR 3299 for Rp 3,299,000): try scaling
    // each candidate by 10^k and keep the first landing in band.
    const inBand: PriceEntry[] = [];
    for (const c of candidates) {
      if (c.price >= PRICE_MIN && c.price <= PRICE_MAX) {
        inBand.push(c);
        continue;
      }
      // Off by a power of ten — rescale into band from either side.
      let scaled = c.price;
      while (scaled < PRICE_MIN) scaled *= 10;
      while (scaled > PRICE_MAX) scaled /= 10;
      if (scaled >= PRICE_MIN) {
        inBand.push({ ...c, price: Math.round(scaled * 100) / 100 });
        rescaled++;
      }
    }
    if (!inBand.length) {
      dropped++;
      continue;
    }
    // Cluster candidates within 2× of each other and take the largest
    // cluster's median — variants sharing a slug usually quote the same
    // device in different markets, so the majority cluster is the real
    // MSRP; a single mislabelled-currency outlier loses to it.
    const sortedAll = [...inBand].sort((a, b) => a.price - b.price);
    let bestCluster: PriceEntry[] = [];
    let i = 0;
    while (i < sortedAll.length) {
      let j = i + 1;
      while (j < sortedAll.length && sortedAll[j].price <= sortedAll[i].price * 2) j++;
      const cluster = sortedAll.slice(i, j);
      if (cluster.length > bestCluster.length) bestCluster = cluster;
      i = j;
    }
    bestCluster.sort((a, b) => a.date.getTime() - b.date.getTime());
    finalBySlug.set(slug, bestCluster[Math.floor(bestCluster.length / 2)]);
  }
  bySlug.clear();

  console.log(
    `Dataset prices usable: ${finalBySlug.size} unique device slugs ` +
      `(${unresolved} records with no plausible interpretation, ` +
      `${rescaled} rescaled by ×10^n, ${dropped} slugs dropped)`,
  );

  // --- 3. resolve slugs against devices ---------------------------------
  const slugs = [...finalBySlug.keys()];
  const devices = await DeviceModel.find({ slug: { $in: slugs } }, { _id: 1, slug: 1 })
    .lean();
  const deviceIdBySlug = new Map<string, string>();
  for (const d of devices as any[])
    deviceIdBySlug.set(d.slug, d._id.toString());
  console.log(`Matched ${deviceIdBySlug.size}/${finalBySlug.size} slugs to devices`);

  // --- 4. write price history -------------------------------------------
  if (DRY_RUN) {
    console.log('DRY RUN — nothing written.');
    await disconnect();
    return;
  }
  // Replace prices we are about to backfill so a re-run refreshes values,
  // while leaving any prices added by other means untouched.
  const targetIds = [...deviceIdBySlug.values()].map((id) => new mongoose.Types.ObjectId(id));
  await PriceHistoryModel.deleteMany({ device: { $in: targetIds } });
  console.log('Cleared existing rows for devices being backfilled');

  const BATCH = 500;
  let batch: any[] = [];
  let written = 0;

  const flush = async () => {
    if (!batch.length) return;
    await PriceHistoryModel.bulkWrite(
      batch.map((doc) => ({ insertOne: { document: doc } })),
      { ordered: false },
    );
    written += batch.length;
    batch = [];
    console.log(`  [${written}] price rows written`);
  };

  for (const [slug, entry] of finalBySlug) {
    const deviceId = deviceIdBySlug.get(slug);
    if (!deviceId) continue;
    batch.push({
      device: new mongoose.Types.ObjectId(deviceId),
      country: 'Global',
      price: entry.price,
      currency: 'USD',
      retailer: 'Official Store',
      affiliateUrl: '',
      date: entry.date,
    });
    if (batch.length >= BATCH) await flush();
  }
  if (batch.length) await flush();

  console.log(`\nDone: ${written} price rows written`);
  await disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
