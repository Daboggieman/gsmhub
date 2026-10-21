# GSMHub — Full Project Audit Report (2026-10-20)

Scope: backend (NestJS + MongoDB), frontend (Next.js), shared, seed pipelines, e2e/config, security.
Supplementary: three parallel adversarial reviews (backend logic, security, frontend) + direct verification against the live seeded DB.

## Executive summary

The project builds clean (shared ✓, backend ✓ typecheck, frontend ✓ build), backend unit tests pass (11 suites / 64 tests), and the database is freshly seeded with **15,450 devices, 496 brands** from the PhoneDB 25K dataset with **zero true duplicates** (all 37 same-name groups are genuine regional/storage variants). The functional core is in good shape. However the audit found:

- **1 critical security issue** (committed admin JWT + usable signing key + default admin credentials in source),
- **1 critical functional bug** (the public `/search` endpoint 500s on every call),
- **~10 confirmed backend bugs** (price filter/sort dead, pagination totals wrong, stale popular cache, seeds re-introduce broken slugs, etc.),
- **several integration bugs between seed data and frontend** (seeded images point to `phonedb.net` which next/image blocks → all device images broken),
- **~15 potential problems** (rate limiting, token revocation, unbounded limits, cache resilience, concurrency).

Nothing below is opinionated style — each item cites concrete file:line and a reproduction.

---

## CRITICAL — security

### SEC-1. Admin JWT signing key effectively disclosed (committed `cookies.txt` + matching `.env` secret)
- `cookies.txt` (repo root) is **git-tracked** and contains an admin `auth_token` cookie signed with the same `JWT_SECRET` present in `backend/.env` (`491097c8…`). I verified the cookie sets `role: admin`. The token itself is expired, but the point stands: the signing key is in the working tree and the secret value is not deployment-unique.
- `JwtStrategy.validate` (backend/src/modules/auth/strategies/jwt.strategy.ts:25-27) trusts `payload.role` from the token with no DB lookup, so minting `{role:'admin'}` with this secret grants full admin API access (device create/update/delete, price writes, audit-log read, bulk-import, sync). e2e admin spec depends on the same default creds.
- **Action: rotate `JWT_SECRET`, `MONGO_URI` password, and `RAPIDAPI_KEY`; `git rm --cached cookies.txt` and purge from history; add `cookies.txt` to `.gitignore`.** Secret rotation must cover anything that was on disk.

### SEC-2. Hardcoded admin credentials in seed scripts
- backend/src/seed.ts:74 and backend/src/seed-phonedb.ts:268 create `admin@gsmhub.com` / `admin123` (bcrypt-hashed at rest, but plaintext in source; used by e2e/admin-flow.spec.ts:12).
- Any deployed instance not reconfiguring has a known default admin login.
- **Action: read admin password from env with no fallback (fail unless set) in both seeds; force password change on first login.**

### SEC-3. Live secrets in `.env` (uncommitted, present on disk)
- backend/.env: real-looking Atlas MONGO_URI (user/pass), JWT_SECRET, RAPIDAPI_KEY. The file is gitignored (good), but it has been viewed on disk and, combined with SEC-1, the JWT secret is compromised.
- **Action: rotate all three immediately.**

### SEC-4. JWT not revoked when a user is deleted/deactivated/role-changed
- jwt.strategy.ts:25-27 does not load the user from DB; `isActive` (schemas/user.schema.ts) is never consulted; RolesGuard trusts the token claim.
- A deactivated/deleted admin keeps a valid token for the full 60-min lifetime.
- **Fix: load user in `validate()` (with short cache), reject missing/`!isActive`; add token-version or shorten TTL for role changes.**

---

## CRITICAL — functional

### BUG-1. Public `/search` endpoint is broken (500 on every call)
- backend/src/modules/search/search.service.ts:29-46 builds `{ $or: [{ $text: … }, { name: regex }, …] }`. MongoDB forbids `$text` inside `$or`; I reproduced against the live DB: `No query solutions`.
- Every `GET /search?q=…` → 500. The device **list** search (`/devices?search=`) works (devices.repository.ts:44-53 deliberately avoids `$text`), so the outage is easy to miss.
- **Fix: drop `$text` from the `$or` (regex on name/brand/model, as the repository does), and consider a real text index on `name`/`brand`/`model` used outside `$or`.**

### BUG-2. Seeded device images are broken site-wide
- All seeded devices store `imageUrl` from `phonedb.net` (verified: 500/500 sampled); DeviceCard/DeviceGallery/etc. use `next/image`, and `next.config.ts` remotePatterns does **not** include `phonedb.net`.
- next/image refuses unconfigured external hosts → every device card/detail image fails to render.
- **Fix: add `phonedb.net` (pathname `/**`) to remotePatterns. Also add it for any other dataset host used.**

---

## HIGH — confirmed bugs (backend logic)

### BUG-3. Price filtering & price sorting are dead (field never persisted)
- devices.repository.ts:80-84 filters `query.latestPrice` and :97-101 sorts by it, but `latestPrice` is only attached in-memory to query results (devices.service.ts:43-73) and **never saved** to the Device doc (grep confirms: schema decl + repository query + service attach only).
- `GET /devices?minPrice=…` and `sort=price_low/high` return empty; `findSimilar`'s price ±20% branch (devices.service.ts:529-532) can never match → "similar" is effectively same-category only.
- **Fix: compute price via `$lookup` into pricehistory (take latest), or persist `latestPrice` on device write and invalidate on price changes; then update `countAll` to apply the same filters.**

### BUG-4. Pagination totals are wrong whenever range filters are used
- devices.repository.ts:123-145 `countAll` honors only category/brand/search; `getAllDevices` (devices.service.ts:96) uses findAll + countAll. min/max RAM/storage/battery/display/price filters change `findAll` but not the count → `total`/`totalPages` off (and with price filters, total>0 while devices=[]).
- **Fix: make countAll apply the full filter set (including the BUG-3 price join).**

### BUG-5. Popular-devices cache never invalidates (key mismatch)
- Read at `popular_devices_${limit}` (devices.service.ts:236-238); all deletes use `popular_devices` (lines 177, 222, 232, 284, 395). Stale popular list survives up to the 1h TTL after any write; cache hit serves stale views.
- **Fix: delete `popular_devices_*` (or use fixed keys without the limit suffix).**

### BUG-6. Unhandled rejection in search analytics (crash risk + duplicate-key race)
- search.service.ts:22 fires `logSearchQuery` unawaited/uncaught; :116-125 upserts on unique `query` (search-query.schema.ts:8-9). Two concurrent first-time searches → E11000 on one; node unhandled-rejection can crash the process.
- Also fixes when search itself 500s (BUG-1).
- **Fix: `await this.logSearchQuery(query).catch(()=>{})` and make the upsert E11000-tolerant.**

### BUG-7. Whitespace-only `q` on `/search` → 500
- search.service.ts:19 guards only falsy; `q=%20` → `$text:{search:''}` error; regex `''` hits everything.
- **Fix: trim, return [] on empty.**

### BUG-8. Unvalidated `limit` on public endpoints → 500 (NaN into MongoDB)
- devices.controller.ts:100-116 (popular/trending), 131-152 (category/brand), search.controller.ts:10-20, audit-log.controller.ts:22-28, compare: `parseInt('abc')` → NaN → `.limit(NaN)`/`$limit:NaN` → Mongo error → 500. Only `/devices` caps (61-62).
- Also unbounded: `limit=999999999` forces huge result sets (see SEC/H3).
- **Fix: clamp limit with Number.isFinite + max cap everywhere `limit` is parsed.**

### BUG-9. Compare 500s when a device has no specs
- compare.service.ts:39 `device.specs.forEach` with no guard; schema `specs` is optional. Any device created/upserted without specs → `/compare` throws → 500.
- **Fix: `(device.specs || []).forEach` (both loops).**

### BUG-10. Price API can't set affiliate links (DTO field name mismatch)
- prices/dto/price.dto.ts uses `url`; schema prop is `affiliateUrl` (price-history.schema.ts:25-26). create/update spread the DTO directly → `affiliateUrl` never populated through the API; stray `url` field written.
- **Fix: map `url → affiliateUrl`, add `@IsUrl`/`@IsString`.**

### BUG-11. Redis down ⇒ public device pages 500
- devices.service.ts:136-147 (findBySlug) and :236-251 (popular) call cache get/set with no try/catch; Keyv/Redis rejection propagates → public pages fail instead of degrading to DB.
- **Fix: wrap cache ops in try/catch (log + continue).**

### BUG-12. Seed re-introduces trailing-dash slugs; slug uniqueness is not guaranteed
- shared/src/utils/slug.ts collapses `--+` but never strips leading/trailing `-`. Names ending in `+` (e.g. "Samsung Galaxy S8 Duos +") produce `samsung-galaxy-s8-duos-` (verified via slugtest.ts, and the seed actually wrote 15 such slug docs).
- My earlier attempt to blanket-strip `-+$` in `generateSlug` was **intentionally reverted**: "X" and "X +" are different devices that would then collide on the same slug, and the `byKey` map / `replaceOne` upsert in seed-phonedb.ts:358-360 would silently drop one on reseed (7 of the 16 dash slugs collided with real base devices during DB testing).
- **Recommended fix (not a blanket strip): disambiguate in the mapper — when a computed slug already exists in `byKey`, append a deterministic suffix (e.g. `-2`, or keep a `+`→`-plus` mapping).** This keeps variants distinct and slugs clean. Add the strip only alongside collision handling.

---

## MEDIUM — potential problems

- **Rate limiting:** single global 100 req/60s bucket for all routes incl. `/auth/login` (app.module.ts:55-58). Anonymous attacker can exhaust it and DoS the API; login brute force shares the budget. No `trust proxy`; behind a proxy the counter is per-proxy-IP. → per-route throttle (esp. login), Redis-backed counters, trust proxy.
- **Unbounded content pull:** `/devices/popular|trending|category|brand?limit=…`, `/search?limit=…`, `/compare?devices=<N>` (each slug triggers a DB find + price aggregation) have no cap beyond BUG-8's NaN. Cap at e.g. 50 and cap compare to ~4 devices.
- **Cookie lifetime mismatch:** cookie `maxAge` 24h (auth.controller.ts:21) but JWT expires in 60m (auth.module.ts:19) → after 60m client looks logged in but every call 401s for 23 hours. Align cookie maxAge to token TTL.
- **`latestPrice` staleness in cache:** `findBySlug` caches the doc with attached price for 3600s; price writes never invalidate `device_<slug>`. Covered partially by BUG-3's fix (persist canonical price + invalidate).
- **fullSync concurrency:** weekly cron (sync.service.ts Sunday 03:00) can overlap an admin-triggered `/external-api/sync/all` with `forceUpdate:true`; errors swallowed. → Redis mutex + resume.
- **Weekly cron is a ~17-min blocking loop** inside the Nest process (5s/device × 200 cap + 2s/brand). Make it resumable/alert on failure.
- **getPriceTrend division by zero** (prices.service.ts:98) when previous price is 0 → Infinity. Guard 0.
- **N+1 bulk import** (devices.service.ts:476-507): per-row sequential findBySlug + category lookup + update; whole file buffered in RAM first. → batch via bulkWrite, stream.
- **getAllDevices does 3 DB round-trips** per listing (findAll + countAll + price aggregation) — parallelize / collapse.
- **Numeric range filters effectively dead too:** transformer "extract*Value" helpers are defined but never wired (data-transformation.service.ts:293-437); `ramValue`/`batteryValue`/`storageValue`/`displaySizeValue` are never populated by any seed/upsert → RAM/storage/battery/display min/max filters can never match (same root as BUG-3/4). Wire them at ingest.
- **wildcard `$**` text index** (device.schema.ts:148): large, and unusable in the `$or` patterns the code actually uses; prefer targeted field text index or drop it.
- **`mongooseConfig` is dead code** (config/mongoose.config.ts) — app.module.ts uses its own forRootAsync; the localhost fallback contradicts the fail-fast validate(). Delete.
- **Audit-log target parsing** (audit-log.interceptor.ts:37): query string stays glued to targetId (`abc?x=1`); strip before parsing. `sanitizeBody` only masks top-level keys.
- **SearchIndex schema is dead** (search-index.schema.ts) — defined/imported, never read or written.
- **`dangerouslyAllowSVG: true`** (next.config.ts:5) widens the image attacker surface; keep remotePatterns strict. Fine as-is given current hosts, but worth a comment in config.

---

## LOW / housekeeping

- `cookies.txt` should be removed + gitignored (SEC-1).
- `backend/rapidssl-g1.crt.pem` is git-tracked; it's a public TLS intermediate (not secret) but shouldn't live in the repo.
- `e2e/admin-flow.spec.ts` expects redirect to `/admin/auth/login` but the actual route is `/admin/login`; also hardcodes default creds and `a.device-card` selector (verify DeviceCard has that class) → e2e likely fails.
- `playwright.config.ts` uses `npm run dev --prefix frontend` inside a pnpm workspace → switch to pnpm.
- `test-devices` page ships in the public app (from the build listing) — confirm it's not exposed in production.
- Leftover diagnostic scripts in backend/ (tmp-dupe*.cjs, tmp-dash*.cjs, tmp-fix-dash.cjs, tmp-search-probe.cjs, tmp-idx.cjs, tmp-img-hosts.cjs, tmp-search-probe.cjs, slugtest.ts, slug-hygiene.gen.ts, test-slug-hygiene.ts) — clean up before PR; none are wired into anything.

---

## Frontend-specific findings (from direct review; full frontend agent report pending)

- **FE-1. CSV bulk-import broken** — api.ts:139-151 sends `headers:{}` intending the browser to set the multipart boundary, but `ApiClient.request` always forces `Content-Type: application/json` → backend `FileInterceptor` (multipart) can't parse → import fails. Fix: make `request` skip the JSON content-type when body is FormData.
- **FE-2. Seeded images render broken** — see BUG-2 (`phonedb.net` not in remotePatterns).
- **FE-3. `generateStaticParams` only pre-renders 100 device pages** (devices/[slug]/page.tsx:79-88) → 15,350/15,450 device pages are dynamic. For SEO, either raise the limit (costly) or accept on-demand SSR.
- **FE-4. auth-context `token` always null** (auth-context.tsx:66) — dead interface field; app correctly uses HttpOnly cookie. Also `auth_user` localStorage written on login but never read back — dead. Minor.
- **FE-5. Admin session race** (auth-context login():44-48 + admin/layout.tsx:18-22) — mostly benign within SPA; hard-reload re-checks cookie. Watch intermittency.
- **FE-6. e2e admin spec wrong route + hardcoded creds** — see LOW section.
- **FE-7. Search regex highlight** — verify SearchBar escapes user input before `new RegExp`; if not, metacharacters throw. (Backend already escapes; frontend must too.)
- **FE-8. Public leaks to check**: the `/test-devices` page is in the build output — confirm it's not production-reachable (or remove).

---

## Verified-OK summary (so we don't re-fix good things)

- Auth: bcrypt+salt hashing, HttpOnly + SameSite=lax + secure-in-prod cookie, `ignoreExpiration:false`, admin routes guarded server-side (not just hidden in frontend), roles enforced on all writes, IDOR-safe users routes (req.user.userId).
- Injection: `escapeRegExp` at every regex site, no `$where`, no raw user input into operators, category IDs validated.
- XSS: only two `dangerouslySetInnerHTML` uses are JSON-LD (safe) and a static ad script.
- No arbitrary-URL SSRF: external API hosts/URLs are fixed env templates; only path segments interpolated.
- CORS: allowlist + `credentials`, deny-by-reflector; HSTS in prod; nosniff/X-Frame/Permissions-Policy set.
- Backend unit tests 64/64 green; shared + backend + frontend typecheck/build pass.
- Device data: no duplicates (37 name-groups are genuine variants); categories/brands upserted consistently.

---

## Suggested fix order

1. **Security:** rotate secrets, remove `cookies.txt`, env-driven admin password (SEC-1/2/3/4).
2. **BUG-1** (`/search` 500) — one-line-ish, restores core functionality.
3. **BUG-2** (image hosts) — one-line config, restores all images.
4. **BUG-3/4/10** (prices: persist `latestPrice`, fix count, affiliateUrl) — one feature-area.
5. **BUG-8/9/7** (public 500s: limit clamp, compare null specs, whitespace query).
6. **BUG-5/11/6** (cache invalidation/robustness + analytics race).
7. **BUG-12** mapper slug disambiguation (collision-safe).
8. Medium findings (rate limit, compare cap, cron/redis resilience, cookie TTL, bulk-import batching).
9. Housekeeping (e2e fixes, playwright pnpm, dead code, tmp scripts, test-devices page).
