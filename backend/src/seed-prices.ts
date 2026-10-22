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

function extractCurrency(sp: RawRecord['specs']): string {
  // The currency spec is serialized under the literal key "null".
  const raw = v(sp, 'null').toUpperCase();
  const m = raw.match(/([A-Z]{3})/);
  return m ? m[1] : '';
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
  if (DRY_RUN) {
    console.log('DRY RUN — nothing written.');
    await disconnect();
    return;
  }

  if (CLEAN_DANGLING) {
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

  // --- 2. build dataset price map: slug → { priceUsd, date, currency } --
  console.log('Mapping dataset prices...');
  interface PriceEntry {
    price: number; // USD
    currency: string; // original launch currency
    originalPrice: number;
    date: Date;
  }
  const bySlug = new Map<string, PriceEntry>();
  let withPrice = 0;
  let unknownCurrency = 0;

  for (const rec of dataset) {
    const sp = rec.specs;
    const priceRaw = extractPrice(sp);
    if (priceRaw === null) continue;
    withPrice++;

    const currency = extractCurrency(sp);
    const rate = TO_USD[currency];
    if (!rate) {
      unknownCurrency++;
      continue;
    }

    const brand = v(sp, 'Brand') || 'Unknown';
    const model = v(sp, 'Model') || rec.title;
    const name = cleanName(model);
    if (!name) continue;

    const slug = generateSlug(`${brand} ${name}`);
    const price = Math.round(priceRaw * rate * 100) / 100;
    const date = parseDate(v(sp, 'Announced') || v(sp, 'Released'));

    // Keep the highest-priced variant per slug (flagship trim, most useful)
    const prev = bySlug.get(slug);
    if (!prev || price > prev.price) {
      bySlug.set(slug, { price, currency, originalPrice: priceRaw, date });
    }
  }

  console.log(
    `Dataset prices usable: ${bySlug.size} unique device slugs ` +
      `(${withPrice} records with Price, ${unknownCurrency} unknown currency skipped)`,
  );

  // --- 3. resolve slugs against devices ---------------------------------
  const slugs = [...bySlug.keys()];
  const devices = await DeviceModel.find({ slug: { $in: slugs } }, { _id: 1, slug: 1 })
    .lean();
  const deviceIdBySlug = new Map<string, string>();
  for (const d of devices as any[])
    deviceIdBySlug.set(d.slug, d._id.toString());
  console.log(`Matched ${deviceIdBySlug.size}/${bySlug.size} slugs to devices`);

  // --- 4. write price history -------------------------------------------
  if (DRY_RUN) {
    console.log('DRY RUN — nothing written.');
    await disconnect();
    return;
  }

  const existing = new Set(
    (await PriceHistoryModel.find({}, { device: 1 }).lean()).map((p) =>
      (p.device as any).toString(),
    ),
  );

  const BATCH = 500;
  let batch: any[] = [];
  let written = 0;
  let skippedExisting = 0;

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

  for (const [slug, entry] of bySlug) {
    const deviceId = deviceIdBySlug.get(slug);
    if (!deviceId) continue;
    if (existing.has(deviceId)) {
      skippedExisting++;
      continue;
    }
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

  console.log(
    `\nDone: ${written} price rows written, ${skippedExisting} devices already had prices`,
  );
  await disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
