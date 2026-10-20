/**
 * One-time bulk seed from the PhoneDB 25K dataset (HuggingFace:
 * Nadirova/Phone_SpecsDataset_25K, parsed from phonedb.net).
 *
 * Maps the dataset to our Device schema, merges regional variants into one
 * device per (brand, clean name), and bulk-writes to MongoDB in minutes —
 * no scraping, no rate limits.
 *
 * Run:  NODE_EXTRA_CA_CERTS=./rapidssl-g1.crt.pem pnpm seed:phonedb
 * Env:
 *   PHONEDB_JSON=path    dataset location (default .seeddata/PhoneSpecsDataset25K.json at repo root)
 *   SEED_MAX_DEVICES=n   cap total devices written
 *   NO_WIPE=1            keep existing devices (default: wipes devices)
 *   ONLY_SMARTPHONES=0   include tablets/watches/etc (default: smartphones only)
 */
import { connect, disconnect } from 'mongoose';
import { config } from 'dotenv';
import { DeviceSchema } from './modules/devices/device.schema';
import { BrandSchema } from './modules/brands/brand.schema';
import { CategorySchema } from './modules/categories/category.schema';
import { UserSchema, UserRole } from './modules/users/schemas/user.schema';
import { DeviceType } from '@shared/types';
import { generateSlug } from './common/utils/slug.util';

import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';

config();

const DATASET_PATH =
  process.env.PHONEDB_JSON || '/home/recoding/gsmhub/.seeddata/PhoneSpecsDataset25K.json';
const maxDevices = Number(process.env.SEED_MAX_DEVICES) || 0;
const onlySmartphones = process.env.ONLY_SMARTPHONES !== '0';
const wipe = process.env.NO_WIPE !== '1';

// PhoneDB "Device Category" → our DeviceType
const CATEGORY_MAP: Record<string, DeviceType> = {
  Smartphone: DeviceType.PHONE,
  Tablet: DeviceType.TABLET,
  Smartwatch: DeviceType.SMARTWATCH,
  Notebook: DeviceType.LAPTOP,
  Subnotebook: DeviceType.LAPTOP,
};

interface RawRecord {
  title: string;
  url: string;
  img: string;
  specs: Record<string, { key: string; value: string | null } | null>;
}

interface MappedDevice {
  slug: string;
  name: string;
  brand: string;
  model: string;
  type: DeviceType;
  isActive: boolean;
  category: string; // brand name — resolved to Category._id before insert
  imageUrl?: string;
  releaseDate?: string;
  dimension?: string;
  weight?: string;
  os?: string;
  storage?: string;
  displaySize?: string;
  ram?: string;
  battery?: string;
  chipset?: string;
  mainCamera?: string;
  selfieCamera?: string;
  videoResolution?: string;
  networkTechnology?: string;
  views: number;
  specs: { category: string; key: string; value: string }[];
}

// Metadata / noise keys that must not become spec rows
const NOISE_KEYS = new Set([
  'Added',
  'Data Integrity',
  'null',
  'Market Countries',
  'Market Regions',
  'Mobile Operator',
  'OEM ID',
  'Price',
  'Sec. Supported Cellular Networks',
  'Sec. Supported Cellular Data Links',
]);

/** Read a spec value; null, empty and bare ":" → '' */
function v(sp: RawRecord['specs'], key: string): string {
  const entry = sp[key];
  if (!entry || entry.value === null || entry.value === undefined) return '';
  const s = String(entry.value).trim();
  return s === ':' || /^\s*$/.test(s) ? '' : s;
}

/** Clean "SM-S721J Galaxy S24 FE 5G TD-LTE JP 128GB SCG30" → "Galaxy S24 FE" */
function cleanName(model: string): string {
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
    .replace(/^[-\s]+|[-\s]+$/g, '');
  return out || model;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** "2023 Sep 22" → "2023, September 22"; other formats pass through. */
function normalizeRelease(raw: string): string {
  const m = raw.match(/^(\d{4})\s+([A-Za-z]{3})(?:\s+(\d{1,2}))?/);
  if (!m) return raw;
  const mi = MONTHS.indexOf(m[2]);
  if (mi < 0) return raw;
  return m[3]
    ? `${MONTH_NAMES[mi]}, ${Number(m[3])}`
    : `${MONTH_NAMES[mi]} ${m[1]}`;
}

function mmToInches(mm: string): string | undefined {
  const m = mm.match(/([\d.]+)\s*mm/);
  if (!m) return undefined;
  return `${(parseFloat(m[1]) / 25.4).toFixed(2)}"`;
}

function extractStorage(sp: RawRecord['specs']): string | undefined {
  const raw = v(sp, 'Non-volatile Memory Capacity (converted)');
  if (!raw) return undefined;
  const m = raw.match(/([\d.]+)\s*(TB|GiB|GB)/i);
  if (!m) return raw;
  const gb =
    m[2].toUpperCase() === 'TB' ? parseFloat(m[1]) * 1024 : parseFloat(m[1]);
  return `${gb}GB`;
}

function extractRam(sp: RawRecord['specs']): string | undefined {
  const raw = v(sp, 'RAM Capacity (converted)');
  if (!raw) return undefined;
  const m = raw.match(/([\d.]+)\s*(GiB|GB|MB)\s*RAM/i);
  return m ? `${parseFloat(m[1])}GB` : raw;
}

function extractBattery(sp: RawRecord['specs']): string | undefined {
  const raw = v(sp, 'Nominal Battery Capacity');
  return raw ? raw.replace(/\s*battery\s*$/i, '').trim() : undefined;
}

function extractCamera(sp: RawRecord['specs'], key: string): string | undefined {
  const raw = v(sp, key);
  return raw
    ? raw.replace(/\s*(camera|sec\. cam|aux\. cam)\s*$/i, '').trim()
    : undefined;
}

function extractVideoRes(sp: RawRecord['specs'], key: string): string | undefined {
  const raw = v(sp, key);
  const m = raw.match(/(\d+)x(\d+)/);
  if (!m) return raw || undefined;
  const h = Number(m[2]);
  return (
    (h >= 4320 ? '8K' : undefined) ||
    (h >= 2160 ? '4K' : h >= 1440 ? '1440p' : h >= 1080 ? '1080p' : h >= 720 ? '720p' : `${h}p`)
  );
}

function extractNetwork(sp: RawRecord['specs'], model: string): string | undefined {
  const m = model.toUpperCase();
  if (/5G/.test(m)) return 'GSM / CDMA / HSPA / LTE / 5G';
  if (/LTE|4G/.test(m)) return 'GSM / HSPA / LTE';
  return v(sp, 'Supported Cellular Data Links') || undefined;
}

function mapRecord(rec: RawRecord): MappedDevice | null {
  const sp = rec.specs;
  const brand = v(sp, 'Brand') || 'Unknown';
  const model = v(sp, 'Model') || rec.title;
  const type = CATEGORY_MAP[v(sp, 'Device Category')] || DeviceType.OTHER;
  if (onlySmartphones && type !== DeviceType.PHONE) return null;

  const name = cleanName(model);
  if (!name) return null;

  const specs: { category: string; key: string; value: string }[] = [];
  for (const [key, entry] of Object.entries(sp)) {
    if (!entry || key === 'null' || NOISE_KEYS.has(key)) continue;
    const value = v(sp, key);
    if (!value) continue;
    specs.push({ category: 'Specifications', key, value });
  }

  const displayInches = mmToInches(v(sp, 'Display Diagonal'));
  const res = v(sp, 'Resolution');
  const height = parseFloat(v(sp, 'Height'));
  const width = parseFloat(v(sp, 'Width'));
  const depth = parseFloat(v(sp, 'Depth'));
  const dimension =
    height && width && depth ? `${height} x ${width} x ${depth} mm` : undefined;

  const cpu = v(sp, 'CPU');

  return {
    slug: generateSlug(`${brand} ${name}`),
    name: `${brand} ${name}`.trim(),
    brand,
    model,
    type,
    isActive: true,
    category: brand,
    imageUrl: rec.img || undefined,
    releaseDate: normalizeRelease(v(sp, 'Released')) || undefined,
    dimension,
    weight: v(sp, 'Mass') || undefined,
    os: v(sp, 'Operating System') || undefined,
    storage: extractStorage(sp),
    displaySize: displayInches
      ? res
        ? `${displayInches} (${res})`
        : displayInches
      : res || undefined,
    ram: extractRam(sp),
    battery: extractBattery(sp),
    chipset: cpu ? cpu.split(',')[0].trim() : undefined,
    mainCamera: extractCamera(sp, 'Number of effective pixels'),
    selfieCamera: extractCamera(sp, 'Secondary Camera Number of pixels'),
    videoResolution: extractVideoRes(sp, 'Video Recording'),
    networkTechnology: extractNetwork(sp, model),
    views: 0,
    specs,
  };
}

async function seedAdmin(UserModel: mongoose.Model<any>) {
  const adminEmail = 'admin@gsmhub.com';
  const existing = await UserModel.findOne({ email: adminEmail });
  if (!existing) {
    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash('admin123', salt);
    await UserModel.create({
      email: adminEmail,
      password: hashed,
      name: 'Admin User',
      role: UserRole.ADMIN,
      isActive: true,
    });
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }
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
  const BrandModel = mongoose.model('Brand', BrandSchema);
  const CategoryModel = mongoose.model('Category', CategorySchema);
  const UserModel = mongoose.model('User', UserSchema);

  await seedAdmin(UserModel);

  if (wipe) {
    await DeviceModel.deleteMany({});
    console.log('Wiped devices collection');
  }

  // --- map records -----------------------------------------------------
  console.log('Mapping records...');
  const byKey = new Map<string, MappedDevice>();
  let skippedCategory = 0;

  for (const rec of dataset) {
    const dev = mapRecord(rec);
    if (!dev) {
      if (onlySmartphones) skippedCategory++;
      continue;
    }
    if (!byKey.has(dev.slug)) {
      byKey.set(dev.slug, dev);
      if (maxDevices && byKey.size >= maxDevices) break;
    }
  }

  console.log(
    `Mapped ${byKey.size} devices from ${dataset.length} records` +
      (onlySmartphones ? ` (${skippedCategory} non-smartphone records skipped)` : ''),
  );

  // --- categories + brands --------------------------------------------
  const brands = [...new Set([...byKey.values()].map((d) => d.brand))];
  const catIdByBrand = new Map<string, string>();
  for (const brand of brands) {
    const slug = generateSlug(brand) || 'unknown';
    const doc = await CategoryModel.findOneAndUpdate(
      { $or: [{ slug }, { name: brand }] },
      { $set: { name: brand, slug } },
      { upsert: true, new: true },
    );
    if (doc) catIdByBrand.set(brand, (doc as any)._id.toString());
  }
  console.log(`Categories upserted: ${catIdByBrand.size}`);

  for (const brand of brands) {
    await BrandModel.updateOne(
      { slug: generateSlug(brand) },
      { $set: { name: brand, slug: generateSlug(brand) } },
      { upsert: true },
    );
  }
  console.log(`Brands upserted: ${brands.length}`);

  // --- bulk write ------------------------------------------------------
  console.log('Inserting devices...');
  const BATCH = 500;
  let written = 0;
  let batch: any[] = [];

  const flush = async () => {
    if (!batch.length) return;
    const ops = batch.map((dev) => ({
      replaceOne: { filter: { slug: dev.slug }, replacement: dev, upsert: true },
    }));
    await DeviceModel.bulkWrite(ops, { ordered: false });
    written += batch.length;
    console.log(`  [${written}] devices written`);
    batch = [];
  };

  for (const dev of byKey.values()) {
    batch.push({
      ...dev,
      category: catIdByBrand.get(dev.category) || null,
    });
    if (batch.length >= BATCH) await flush();
  }
  if (batch.length) await flush();

  console.log(`\nSeed complete: ${written} devices written`);
  await disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
