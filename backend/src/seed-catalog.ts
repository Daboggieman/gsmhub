/**
 * Seed non-phone catalog entries (laptops, earbuds, …) from curated CSVs.
 *
 * The GSMArena scraper and the PhoneDB dataset cover phones, tablets,
 * smartwatches and a handful of notebooks — but no free structured source
 * exists for laptops or earbuds, so those come from hand-curated CSVs in
 * backend/data/catalog/ that act as the source of truth.
 *
 * CSV columns: the core device fields below are recognized; ANY other
 * column becomes a spec row ({"category": "Specifications", key, value})
 * with the header humanized (driver → Driver, ipRating → Ip Rating).
 *
 *   name            required — display name (slug is generated from it)
 *   brand           required
 *   model           optional — defaults to name
 *   type            optional — DeviceType enum value; falls back to
 *                   classifyDeviceType(name), then to the file stem
 *                   (earbuds.csv → ACCESSORY, laptops.csv → LAPTOP)
 *   releaseDate, os, displaySize, storage, ram, battery, weight,
 *   chipset, description, imageUrl — optional core fields
 *   (category is always derived from type — do not put a category column)
 *
 * Numeric filter mirrors (ramValue, storageValue, batteryValue,
 * displaySizeValue) are derived automatically.
 *
 * Run:  pnpm seed:catalog
 * Env:
 *   CATALOG_CSV=a.csv,b.csv  limit to specific files in backend/data/catalog
 *   WIPE_TYPE=ACCESSORY      delete devices of this DeviceType before
 *                            inserting (e.g. to refresh earbuds); repeat
 *                            runs without it upsert by slug and never
 *                            touch other categories
 */
import { connect, disconnect } from 'mongoose';
import { config } from 'dotenv';
import { DeviceSchema } from './modules/devices/device.schema';
import { CategorySchema } from './modules/categories/category.schema';
import { DeviceType } from '@shared/types';
import {
  DEVICE_TYPE_CATEGORY,
  classifyDeviceType,
} from '@shared/utils/device-class.util';
import { deriveSpecValues } from '@shared/utils/spec-values';
import { generateSlug } from './common/utils/slug.util';

import * as mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

config();

const CATALOG_DIR = path.resolve(__dirname, '../data/catalog');
const ONLY = (process.env.CATALOG_CSV || '')
  .split(',')
  .map((f) => f.trim())
  .filter(Boolean);
const WIPE_TYPES = (process.env.WIPE_TYPE || '')
  .split(',')
  .map((t) => t.trim())
  .filter(Boolean);

/** Core schema fields — everything else in the CSV becomes a spec row. */
const CORE_COLUMNS = new Set([
  'name',
  'brand',
  'model',
  'type',
  'releaseDate',
  'os',
  'displaySize',
  'storage',
  'ram',
  'battery',
  'weight',
  'chipset',
  'description',
  'imageUrl',
]);

/** Fallback DeviceType per file stem when no `type` column is present. */
const STEM_TYPE: Record<string, DeviceType> = {
  earbuds: DeviceType.ACCESSORY,
  laptops: DeviceType.LAPTOP,
  tablets: DeviceType.TABLET,
  watches: DeviceType.SMARTWATCH,
  phones: DeviceType.PHONE,
};

interface Row {
  [column: string]: string | undefined;
}

function humanizeKey(raw: string): string {
  const spaced = raw
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// Small curated files: a simple synchronous RFC-4180-aware reader is
// enough (quoted fields, escaped quotes, CRLF, BOM).
function readCsv(file: string): Row[] {
  const text = fs.readFileSync(file, 'utf-8').replace(/^﻿/, '');
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      cur.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      cur.push(field);
      field = '';
      rows.push(cur);
      cur = [];
    } else field += ch;
  }
  if (field.length || cur.length) {
    cur.push(field);
    rows.push(cur);
  }
  const header = rows.shift() || [];
  return rows
    .filter((r) => r.some((cell) => cell.trim() !== ''))
    .map((r) => {
      const row: Row = {};
      header.forEach((h, i) => {
        const key = h.trim();
        if (key) row[key] = (r[i] ?? '').trim();
      });
      return row;
    });
}

async function main() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) throw new Error('MONGO_URI is not set');

  const files = fs
    .readdirSync(CATALOG_DIR)
    .filter((f) => f.endsWith('.csv'))
    .filter((f) => !ONLY.length || ONLY.includes(f))
    .sort();
  if (!files.length) {
    throw new Error(
      `No CSVs found in ${CATALOG_DIR} (CATALOG_CSV=${process.env.CATALOG_CSV || 'all'})`,
    );
  }

  await connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const DeviceModel = mongoose.model('Device', DeviceSchema as any);
  const CategoryModel = mongoose.model('Category', CategorySchema);

  for (const t of WIPE_TYPES) {
    if (!(t in DeviceType)) {
      throw new Error(
        `WIPE_TYPE="${t}" is not a DeviceType (${Object.values(DeviceType).join('/')})`,
      );
    }
    const res = await DeviceModel.deleteMany({ type: t });
    console.log(`Wiped type=${t}: ${res.deletedCount} devices`);
  }

  let total = 0;
  for (const file of files) {
    const filePath = path.join(CATALOG_DIR, file);
    const rows = readCsv(filePath);
    console.log(`\n=== ${file}: ${rows.length} rows ===`);

    // Cache category ids per class name to avoid repeat upserts.
    const catIdByName = new Map<string, string>();
    let written = 0;

    for (const row of rows) {
      const name = (row.name || '').trim();
      const brand = (row.brand || '').trim();
      if (!name || !brand) {
        console.warn(`  Skipping row missing name/brand: ${JSON.stringify(row).slice(0, 120)}`);
        continue;
      }
      const model = (row.model || name).trim();
      const displayName = `${brand} ${name}`.trim();

      const typeFromColumn =
        row.type && (row.type as string).toUpperCase() in DeviceType
          ? (row.type.toUpperCase() as DeviceType)
          : undefined;
      const type =
        typeFromColumn ||
        STEM_TYPE[path.basename(file, '.csv').toLowerCase()] ||
        classifyDeviceType(displayName);

      // Any non-core column becomes a spec row.
      const specs = Object.entries(row)
        .filter(([key]) => !CORE_COLUMNS.has(key))
        .filter(([, value]) => value && String(value).trim() !== '')
        .map(([key, value]) => ({
          category: 'Specifications',
          key: humanizeKey(key),
          value: String(value).trim(),
        }));

      const core = {
        releaseDate: row.releaseDate || undefined,
        os: row.os || undefined,
        displaySize: row.displaySize || undefined,
        storage: row.storage || undefined,
        ram: row.ram || undefined,
        battery: row.battery || undefined,
        weight: row.weight || undefined,
        chipset: row.chipset || undefined,
        description: row.description || undefined,
        imageUrl: row.imageUrl || undefined,
      };

      const categoryName = DEVICE_TYPE_CATEGORY[type];
      let categoryId = catIdByName.get(categoryName);
      if (!categoryId) {
        const slug = generateSlug(categoryName) || 'other';
        const doc = await CategoryModel.findOneAndUpdate(
          { $or: [{ slug }, { name: categoryName }] },
          { $set: { name: categoryName, slug } },
          { upsert: true, new: true },
        );
        categoryId = (doc as any)._id.toString();
        catIdByName.set(categoryName, categoryId);
      }

      const slug = generateSlug(displayName) || generateSlug(name);
      const numeric = deriveSpecValues(core);

      const doc = await DeviceModel.findOne({ slug }).lean<any>();
      if (doc) {
        await DeviceModel.updateOne(
          { slug },
          {
            $set: {
              name: displayName,
              brand,
              model,
              type,
              category: categoryId,
              isActive: true,
              specs,
              ...core,
              ...numeric,
            },
            $setOnInsert: { views: 0 },
          },
        );
      } else {
        await DeviceModel.create({
          slug,
          name: displayName,
          brand,
          model,
          type,
          category: categoryId,
          isActive: true,
          views: 0,
          specs,
          ...core,
          ...numeric,
        });
      }
      written++;
    }

    console.log(`  ${written} devices written from ${file}`);
    total += written;
  }

  console.log(`\nCatalog seed complete: ${total} devices`);
  await disconnect();
}

main().catch((err) => {
  console.error('Catalog seed failed:', err);
  process.exit(1);
});
