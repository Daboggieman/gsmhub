/**
 * Mapper dry-run harness: validates seed-phonedb mapping against the dataset
 * WITHOUT touching MongoDB. Prints counts, one sample device, coverage.
 *
 * Takes the pure mapping code from seed-phonedb.ts (everything before the
 * DB layer), writes it plus a stats main to test-phonedb-mapper.gen.ts, and
 * requires it in-process (ts-node compiles the generated .ts on the fly).
 *
 * Run: pnpm exec ts-node -r tsconfig-paths/register --transpile-only test-phonedb-mapper.ts
 */
import * as fs from 'fs';
import * as path from 'path';

// Pure mapping code — everything before the DB layer starts. Relative
// imports are rewritten because the generated file sits at backend/, not
// backend/src/.
const mapperSrc = fs
  .readFileSync(path.join(__dirname, 'src/seed-phonedb.ts'), 'utf-8')
  .split('async function seedAdmin')[0]
  .replace(/from '\.\//g, "from './src/");

const harnessSrc = `${mapperSrc}

(async () => {
  const data = JSON.parse(fs.readFileSync(DATASET_PATH, 'utf-8')) as RawRecord[];

  const byKey = new Map<string, MappedDevice>();
  let skipped = 0;
  for (const rec of data) {
    const dev = mapRecord(rec);
    if (!dev) {
      skipped++;
      continue;
    }
    if (!byKey.has(dev.slug)) byKey.set(dev.slug, dev);
  }
  const devices = [...byKey.values()];

  console.log('records:', data.length);
  console.log('mapped:', devices.length, '| skipped(non-phone):', skipped);

  const pick = devices.find(
    (d) => d.name.includes('Galaxy S24') && !d.name.includes('Ultra'),
  );
  if (pick) {
    console.log('sample device:');
    console.log(
      JSON.stringify({ ...pick, specs: pick.specs.slice(0, 6) }, null, 1).slice(0, 1600),
    );
  }

  const withOs = devices.filter((d) => d.os).length;
  const withRam = devices.filter((d) => d.ram).length;
  const withCam = devices.filter((d) => d.mainCamera).length;
  const withStorage = devices.filter((d) => d.storage).length;
  const withBattery = devices.filter((d) => d.battery).length;
  console.log(
    'coverage: os=' + withOs,
    'ram=' + withRam,
    'cam=' + withCam,
    'storage=' + withStorage,
    'battery=' + withBattery,
  );
  process.exit(0);
})().catch((e) => {
  console.error('harness failed:', e);
  process.exit(1);
});
`;

// Generated module sits next to this file so the mapper's relative imports
// (./modules/..., @shared/types via tsconfig-paths) still resolve.
const genPath = path.join(__dirname, 'test-phonedb-mapper.gen.ts');
fs.writeFileSync(genPath, harnessSrc);
// eslint-disable-next-line @typescript-eslint/no-require-imports
require(genPath);
