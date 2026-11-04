# External Data Sources

GSMHub has a single device-data provider: the **GSMArena scraper**
(`backend/src/modules/external-api/gsmarena-scraper.service.ts`). It fetches
public GSMArena pages directly with native `fetch` — no API key, no quota,
no paid subscription.

> The three RapidAPI providers this doc used to describe (Phone Specs
> Explorer, GSMArena Parser, Mobile Phones2) were removed in November 2026:
> all three listings had died (404), and the real catalog never came from
> them anyway. See the bottom of this file for the history note.

## Catalog Seeding (the real bulk path)

The full device catalog does **not** come from any live API — it is seeded
from the PhoneDB dataset:

| Step | Command | What it does |
|------|---------|--------------|
| 1 | `pnpm run seed:gsma` | Scrapes GSMArena for brands/devices and writes the structure (optional; PhoneDB is the usual path) |
| 2 | `pnpm run seed:phonedb` | Seeds the ~25K-device catalog from a PhoneDB JSON dataset (`PHONEDB_JSON=<path>`) |
| 3 | `pnpm run seed-prices` | Seeds price history (see `docs/deployment.md`) |

Both seed scripts require `ADMIN_PASSWORD` in `backend/.env` when creating
the admin account. After seeding with PhoneDB, run
`pnpm run backfill:spec-values` once if the dataset predates the numeric
spec fields (`ramValue`/`storageValue`/`batteryValue`/`displaySizeValue`).

## GSMArena Scraper

**Base URL:** `https://www.gsmarena.com` (scraped with a desktop
Firefox User-Agent; 20s timeout, 3 attempts with `Retry-After` backoff on
HTTP 429).

**Rate-limit pacing:**

| Delay | Value | Skipped when |
|-------|-------|--------------|
| Between brand pages | 2 s | `seedMode = true` |
| Between device spec fetches | 5 s | `seedMode = true` |

Brand → device-list results are cached for the process lifetime so deep
syncs don't re-scrape a brand page per device (`clearCache()` resets it).

### Public entry points (used by `ExternalApiService`)

| Method | Purpose |
|--------|---------|
| `fetchBrands()` | Scrape `makers.php3` → list of brand names |
| `fetchDevicesByBrand(brandName)` | Resolve the brand, scrape its device list → `{ slug, name, brand, imageUrl }[]` |
| `fetchDeviceSpecs(deviceSlug, brandName, model)` | Fetch and parse a device page by its GSMArena slug (e.g. `apple_iphone_18_pro-14934`) |
| `fetchSpecsByModel(brandName, model)` | Resolve "Brand Model" → slug via the (cached) brand list, then fetch specs |

### Spec-page parsing

`parseDevicePage` extracts the spec table into the app's
`Partial<Device>` shape: top-line fields (OS, display size, chipset,
battery, dimensions, RAM/storage strings), the categorized
`DeviceSpec[]` list, and the image URL. The shared
`deriveSpecValues()` helper (from `@gsmhub/shared`) derives the numeric
filter mirrors (`ramValue`, `storageValue`, `batteryValue`,
`displaySizeValue`) so Phone Finder min/max filters work.

## How Sync Uses It

`ExternalApiService` (same module) delegates everything to the scraper and
is the only consumer the rest of the app sees:

- `providers` defaults to `['gsma']` on every fetch method.
- Unknown provider names are simply ignored — there are no others.
- If the scraper returns nothing, `fetchDeviceSpecs` throws
  `HttpException(404)`; brand/device-list fetches return `[]`.

Sync entry points (all admin-guarded, all keyless):

- `POST /external-api/sync/all` — background full sync
- `POST /external-api/sync/brand/:brand` — deep sync one brand
- `POST /devices/sync` — sync a single device
- Weekly cron (Sundays 03:00) — `fullSync({ providers: ['gsma'] })`

See `sync-service.md` for the sync pipeline itself and
`docs/handover_docs/sync-runbook.md` for operational runbook steps.

## Removed: RapidAPI providers (history)

Until November 2026 the module also integrated three RapidAPI services —
Phone Specs Explorer (`phone-specs-explorer-api.p.rapidapi.com`, primary),
GSMArena Parser (`gsmarenaparser.p.rapidapi.com`, secondary) and Mobile
Phones2 (`mobile-phones2.p.rapidapi.com`, tertiary) — selected via the
`providers` option and authenticated with `RAPIDAPI_KEY`. All three
listings started returning 404, the admin sync UI defaulted to them (so
manual sync silently hit dead endpoints), and the catalog was already
sourced from the PhoneDB dataset — so they were removed along with
`RAPIDAPI_KEY`, the `PRIMARY_/SECONDARY_/TERTIARY_API_HOST/URL` config,
the `HttpModule` registration and the `DataTransformationService`
transformers.
