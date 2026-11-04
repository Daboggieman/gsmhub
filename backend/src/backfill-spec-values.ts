/**
 * One-time backfill: derive ramValue / storageValue / batteryValue /
 * displaySizeValue from each device's stored spec strings so the Phone
 * Finder min/max filters work on already-seeded data.
 *
 * Run: cd backend && pnpm run backfill:spec-values
 *       (or: ts-node -r tsconfig-paths/register --transpile-only src/backfill-spec-values.ts)
 */
import { connect, disconnect } from 'mongoose';
import * as mongoose from 'mongoose';
import { config } from 'dotenv';
import { DeviceSchema } from './modules/devices/device.schema';
import { deriveSpecValues } from '@shared/utils/spec-values';

config();

async function main() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) throw new Error('MONGO_URI is not set');

  await connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const DeviceModel = mongoose.model('Device', DeviceSchema as any);

  let scanned = 0;
  let updated = 0;
  let batch: mongoose.AnyBulkWriteOperation[] = [];

  const BATCH = 200;

  // Stream devices so large DBs don't OOM
  const cursor = DeviceModel.find({}).lean().cursor({ batchSize: BATCH });

  for await (const doc of cursor) {
    scanned++;
    const derived = deriveSpecValues({
      ram: doc.ram,
      storage: doc.storage,
      battery: doc.battery,
      displaySize: doc.displaySize,
    });

    const hasAll =
      doc.ramValue != null ||
      doc.storageValue != null ||
      doc.batteryValue != null ||
      doc.displaySizeValue != null;

    if (hasAll) {
      // Already has at least one — assume backfill was already applied; skip.
      continue;
    }

    if (Object.keys(derived).length > 0) {
      batch.push({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: derived },
        },
      });
      updated++;
    }

    if (batch.length >= BATCH) {
      await DeviceModel.bulkWrite(batch, { ordered: false });
      batch = [];
    }
  }

  if (batch.length > 0) {
    await DeviceModel.bulkWrite(batch, { ordered: false });
  }

  console.log(
    `Scanned ${scanned} devices; backfilled ${updated} with numeric spec values.`,
  );

  await disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
