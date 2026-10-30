/**
 * One-time full-site seed from GSMArena.
 *
 * Scrapes every brand (~126) and every device page (~thousands) and writes
 * everything to MongoDB via the same upsert/gap-fill logic the app uses.
 * This is the initial bulk load — afterwards the app keeps data fresh on its
 * own with the weekly cron in sync.service.ts (Sundays 03:00, rate-limited).
 *
 * Run:  pnpm seed:gsma
 * Flags (env):
 *   SEED_BRANDS=Apple,Samsung   limit to specific brands (comma-separated)
 *   SEED_MAX_DEVICES=500        safety cap on total spec fetches
 *   NO_WIPE=1                   keep existing devices (default: wipes devices)
 */
import { connect, disconnect } from 'mongoose';
import { config } from 'dotenv';
import { DeviceSchema } from './modules/devices/device.schema';
import { BrandSchema } from './modules/brands/brand.schema';
import {
  User,
  UserSchema,
  UserRole,
} from './modules/users/schemas/user.schema';
import { GsmarenaScraperService } from './modules/external-api/gsmarena-scraper.service';
import { CategorySchema } from './modules/categories/category.schema';
import { DeviceSpec, DeviceType } from '@shared/types';
import { generateSlug } from './common/utils/slug.util';

import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

config();

const MONGO_URI = process.env.MONGO_URI;

const onlyBrands = (process.env.SEED_BRANDS || '')
  .split(',')
  .map((b) => b.trim())
  .filter(Boolean);
const maxDevices = Number(process.env.SEED_MAX_DEVICES) || 0; // 0 = no cap
const wipe = process.env.NO_WIPE !== '1';
const resume = process.env.SEED_RESUME === '1';
const DEVICE_DELAY_MS = Number(process.env.SEED_DEVICE_DELAY_MS) || 1200;

interface SeedDevice {
  slug: string;
  name: string;
  brand: string;
  model: string;
  type: string;
  isActive: boolean;
  category: string; // brand name, resolved to Category _id below
  imageUrl?: string;
  description?: string;
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
  colors?: string;
  networkTechnology?: string;
  specs: { category: string; key: string; value: string }[];
}

async function seedAdmin(UserModel: Model<any>) {
  const adminEmail = 'admin@gsmhub.com';
  const existingAdmin = await UserModel.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash('admin123', salt);
    await UserModel.create({
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
      isActive: true,
    });
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }
}

async function seedDB() {
  if (!MONGO_URI) throw new Error('MONGO_URI is not set');
  await connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const DeviceModel = mongoose.model('Device', DeviceSchema as any);
  const BrandModel = mongoose.model('Brand', BrandSchema);
  const CategoryModel = mongoose.model('Category', CategorySchema);
  const UserModel = mongoose.model<User>('User', UserSchema);

  await seedAdmin(UserModel);

  if (wipe) {
    await DeviceModel.deleteMany({});
    await BrandModel.deleteMany({});
    console.log('Wiped devices + brands collections');
  }

  const scraper = new GsmarenaScraperService();
  scraper.seedMode = true; // skip rate-limit pauses between listing pages

  // Same gap-fill semantics as DevicesService.upsertDevice with
  // forceUpdate=false: fill missing fields, never overwrite existing data.
  async function upsertDevice(partial: Record<string, any>) {
    const slug = partial.slug;
    if (!slug) throw new Error('Device slug is required');

    const existing: any = await DeviceModel.findOne({ slug }).lean<any>();
    if (existing) {
      const update: Record<string, any> = {};
      for (const field of [
        'description',
        'releaseDate',
        'dimension',
        'os',
        'storage',
        'displaySize',
        'ram',
        'battery',
        'weight',
        'chipset',
        'mainCamera',
        'selfieCamera',
        'videoResolution',
        'colors',
        'networkTechnology',
        'imageUrl',
      ]) {
        if (!existing[field] && partial[field]) update[field] = partial[field];
      }
      if (partial.specs?.length) {
        const have = new Set((existing.specs || []).map((s: any) => s.key));
        const missing = partial.specs.filter((s: any) => !have.has(s.key));
        if (missing.length) {
          update.specs = [...(existing.specs || []), ...missing];
        }
      }
      if (Object.keys(update).length) {
        await DeviceModel.updateOne({ slug }, { $set: update });
      }
      return;
    }

    const categoryName = partial.category || 'Smartphones';
    const catSlug = generateSlug(categoryName);
    // Upsert by slug OR name — a pre-existing doc with mismatched slug must
    // not make the create() below blow up on the unique name/slug indexes.
    const cat = await CategoryModel.findOneAndUpdate(
      { $or: [{ slug: catSlug }, { name: categoryName }] },
      { $set: { name: categoryName, slug: catSlug } },
      { upsert: true, new: true },
    );

    await DeviceModel.create({
      ...partial,
      category: cat._id,
      views: 0,
      isActive: true,
      type: DeviceType.PHONE,
    });
  }

  // --- 1. Brands --------------------------------------------------------
  console.log('Scraping brand list...');
  const brands = await scraper.scrapeBrands();
  console.log(`Found ${brands.length} brands`);

  for (const brand of brands) {
    await BrandModel.updateOne(
      { slug: generateSlug(brand.name) },
      { $set: { name: brand.name, slug: generateSlug(brand.name) } },
      { upsert: true },
    );
  }
  console.log(`Saved ${brands.length} brands`);

  // --- 2. Devices -------------------------------------------------------
  const targets = onlyBrands.length
    ? brands.filter((b) =>
        onlyBrands.some((t) => b.name.toLowerCase() === t.toLowerCase()),
      )
    : brands;

  let deviceCount = 0;
  let specCount = 0;
  let failedCount = 0;

  // Resume support: remember the last fully-finished brand across runs.
  const ProgressModel = mongoose.model(
    'SeedProgress',
    new mongoose.Schema({
      key: String,
      lastBrand: String,
      updatedAt: Date,
    }),
  );
  let skipUntilPast = '';
  if (resume) {
    const progress: any = await ProgressModel.findOne({ key: 'seed-progress' });
    if (progress?.lastBrand) {
      skipUntilPast = progress.lastBrand;
      console.log(
        `Resuming: skipping brands until after "${skipUntilPast}" (use SEED_BRANDS to override)`,
      );
    }
  }

  for (const brand of targets) {
    if (skipUntilPast) {
      if (brand.name === skipUntilPast) {
        skipUntilPast = '';
        console.log(`\n=== Resuming after ${brand.name} ===`);
      }
      continue;
    }
    console.log(`\n=== Brand: ${brand.name} ===`);
    let items;
    try {
      items = await scraper.fetchDevicesByBrand(brand.name);
    } catch (e: any) {
      console.warn(`  Brand list failed: ${e.message}`);
      continue;
    }
    console.log(`  ${items.length} devices listed`);

    for (const item of items) {
      if (maxDevices && deviceCount >= maxDevices) {
        console.log(`\nReached SEED_MAX_DEVICES=${maxDevices}, stopping.`);
        await disconnect();
        return;
      }

      // Politeness delay between spec-page fetches. GSMArena starts
      // 429-blocking after ~30 rapid requests with no delay at all.
      await new Promise((r) => setTimeout(r, DEVICE_DELAY_MS));

      try {
        const partial = await scraper.fetchDeviceSpecs(
          item.slug,
          brand.name,
          item.name,
        );
        if (!partial) continue;

        partial.type = DeviceType.PHONE;
        partial.isActive = true;
        partial.category = brand.name;

        await upsertDevice(partial);
        deviceCount++;
        specCount += partial.specs?.length || 0;

        if (deviceCount % 25 === 0) {
          console.log(
            `  [${deviceCount}] devices saved (${specCount} spec entries)`,
          );
        }
      } catch (e: any) {
        console.warn(`  Device ${item.name} failed: ${e.message}`);
        failedCount++;
      }
    }

    // Persist per-brand progress so an interrupted run can skip finished
    // brands on restart (SEED_RESUME=1).
    await ProgressModel.updateOne(
      { key: 'seed-progress' },
      { $set: { lastBrand: brand.name, updatedAt: new Date() } },
      { upsert: true },
    );
  }

  console.log(
    `\nSeed complete: ${deviceCount} devices, ${specCount} spec rows, ${failedCount} failures`,
  );
  await disconnect();
}

seedDB().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
