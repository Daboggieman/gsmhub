# Sync Runbook

Operational guide for the device data sync system.

---

## Overview

The sync service pulls device data from the **GSMArena scraper**
(`gsmarena-scraper.service.ts` — direct page fetches, no API key, no
quota) into the local MongoDB database. It is designed to be
**rate-limit-aware** and **resilient**. The full catalog itself is seeded
from the PhoneDB dataset (`pnpm run seed:phonedb`) — sync is the
top-up/new-device path, not the bulk loader.

## Provider

| Provider | Source | Auth | Role |
|----------|--------|------|------|
| `gsma` | `https://www.gsmarena.com` (native fetch, 429 backoff) | none — keyless | Only source |

Until November 2026 there was a 3-tier RapidAPI chain
(Phone Specs Explorer / GSMArena Parser / Mobile Phones2); all three
listings died (404) and were removed, together with `RAPIDAPI_KEY`.

## Smart Sync Strategy

1. **Deep-sync cap** — deep spec fetches are capped at 200 per run
   (weekly cron); devices beyond the cap still get their partial
   catalog record upserted.
2. **Request throttling** — 5 s between device fetches, 2 s between
   brands (skipped in one-time `fullSeed` mode).
3. **Brand-list caching** — each brand's device list is scraped once per
   process and cached; deep syncs don't re-scrape it per device.
4. **Fill Gaps** — only populates missing fields on existing devices (preserves manual edits).
5. **Force Update** flag — when set, overwrites all fields (use with care).

## How to Trigger a Sync

Via the Admin Panel:
1. Log in at `/admin/login`.
2. Go to the Devices page.
3. Use the "Sync Settings" card to toggle "Force Update" (Fill Gaps vs Overwrite).
4. Click "Sync" to start.

Via API:

```bash
curl -X POST http://localhost:3001/external-api/sync/all
```

(Both endpoints are admin-only — send the admin session cookie.)

## Reading Sync Logs

A healthy sync looks like:

```
LOG [SyncService] Starting full data sync from external API...
LOG [SyncService] Fetching brands...
LOG [HTTP] POST /external-api/sync/all 53ms
LOG [SyncService] Fetched and saved 35 brands.
LOG [SyncService] Fetching phones by brand... DeepSync: true
LOG [SyncService] Fetching phones for brand: Apple
LOG [SyncService] Found 143 devices for Apple. Syncing detailed data...
DEBUG [SyncService] Deep syncing specs for Apple iPhone 17 Pro Max...
```

## Rate Limits (Expected Behavior)

GSMArena returns 429 under sustained scraping. The scraper backs off
automatically (honors `Retry-After`, 3 attempts, then gives up on that
page):

```
WARN [GsmarenaScraperService] GSMArena 429 for https://www.gsmarena.com/... — backing off 30s (attempt 1/3)
```

If the backoff is exhausted you'll see the failure surface as:

```
WARN [ExternalApiService] GSMArena scraper device list failed for <brand>: HTTP 429 persisted for ...
WARN [SyncService] Failed to sync device <name>: Device specifications not found in any selected provider
```

This is **normal** under load. The sync continues; failed devices can be
retried on a later run. If 429s persist, stop syncing for a while —
hammering GSMArena harder makes it worse.

## Common Issues

### Brand sync finds 0 devices
The brand name must match GSMArena's naming (the scraper resolves brand →
GSMArena page by name). Check the backend log for
`GSMArena: brand not found: <name>` and use the GSMArena spelling.

### Single-device sync 404s: "not found in any selected provider"
The scraper couldn't resolve the model on the brand's device list. Model
strings must match GSMArena's device names (normalized comparison —
punctuation is ignored). Verify the device exists on gsmarena.com.

### GSMArena returns 403
Bot protection kicked in (too-aggressive scraping or blocked datacenter
IP). Back off; run the sync from a residential IP or wait it out.

### Database collision during sync
Categories/brands collection collision — ensure slugs are unique before sync.

## Monitoring

- Watch backend logs for `WARN [SyncService]` / `WARN [GsmarenaScraperService]` lines during a run.
- Check the Admin Dashboard for device counts before/after sync.
- Failed devices are logged per-device; re-run sync to retry them.
