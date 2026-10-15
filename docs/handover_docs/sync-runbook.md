# Sync Runbook

Operational guide for the device data sync system.

---

## Overview

The sync service pulls device data from external RapidAPI providers into the local MongoDB database. It is designed to be **quota-conscious** and **resilient**.

## 3-Tier Provider Architecture

| Priority | Provider | Host | Role |
|----------|----------|------|------|
| Primary | Phone Specs Explorer | `phone-specs-explorer-api.p.rapidapi.com` | Main source |
| Secondary | GSMArena Parser | `gsmarenaparser.p.rapidapi.com` | Fallback / deep specs |
| Tertiary | Mobile Phones2 | `mobile-phones2.p.rapidapi.com` | Last resort |

If one provider fails or is rate-limited, the service automatically falls through to the next.

## Smart Sync Strategy

The service respects monthly API quotas:

1. **Database existence checks** — skips API calls for devices already in the DB.
2. **Session limits** — caps "Deep Sync" fetches to 5 per session.
3. **Request throttling** — 5-second delay between API hits.
4. **Fill Gaps** — only populates missing fields on existing devices (preserves manual edits).
5. **Force Update** flag — when set, overwrites all fields (use with care).

## How to Trigger a Sync

Via the Admin Panel:
1. Log in at `/admin/login`.
2. Go to the Devices page.
3. Use the "Sync Settings" card to select providers and toggle "Force Update".
4. Click "Sync" to start.

Via API:

```bash
curl -X POST http://localhost:3001/external-api/sync/all
```

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

On the BASIC RapidAPI plan, you will frequently see:

```
ERROR [ExternalApiService] Request to gsmarenaparser.p.rapidapi.com failed: 429 - You have exceeded the rate limit per minute for your plan, BASIC, by the API provider
WARN [SyncService] Failed to sync device <name>: Device specifications not found in any selected provider
```

This is **normal**. The sync continues for devices where data was already fetched. Devices that fail can be retried on a later sync run.

## Common Issues

### "Cast to string failed"
Brand name extraction logic mismatch. Check `data-transformation.service.ts` transformers for Primary/Secondary providers are not swapped.

### Database collision during sync
Categories/brands collection collision — ensure slugs are unique before sync.

### All devices fail with "not found in any selected provider"
All 3 providers are rate-limited. Wait for the rate-limit window to reset, or check your RapidAPI plan quota.

## Monitoring

- Watch backend logs for `WARN [SyncService]` lines during a run.
- Check the Admin Dashboard for device counts before/after sync.
- Failed devices are logged per-device; re-run sync to retry them.
