# Implementation History

Chronological log of significant development sessions, decisions, and changes made to GSMHub.

For the full project roadmap (Phases 1-23), see `ROADMAP.md`.

---

## 2026-10-30 — Phase 18 Deployment Prep + AdSense Prerequisites

- **Same-origin API proxy:** browser API calls now go to `/api/*` (same
  origin), proxied to the backend via `next.config.ts` rewrites +
  `BACKEND_URL`; SSR calls hit the backend directly. Reason: auth is a
  HttpOnly cookie — split `*.onrender.com` origins would make it
  third-party and break admin login on Safari/Brave. Login/logout calls
  moved off direct fetch onto the proxy base (`API_BASE_URL` exported from
  `lib/api.ts`).
- **`render.yaml` Blueprint:** `gsmhub-api` (health check `/health/live`,
  generated JWT_SECRET), `gsmhub-cache` (Key Value free), `gsmhub-web`
  (Next.js + proxy). Only `MONGO_URI` (Atlas) is prompted; Node 22 pinned.
- **AdSense approval pages:** `/privacy`, `/terms`, `/about`, `/contact`
  created (footer previously linked to two 404s); footer affiliate
  disclosure added; six dead footer links removed; public
  `/test-devices` fixture page deleted (thin content).
- **`/ads.txt` route:** serves the Google record once
  `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` is set; comment-only until then.
- **Docs:** `docs/deployment.md` (full Render+Atlas walkthrough),
  `docs/monetization-setup.md` (AdSense/Amazon/Jumia-Kolibri signup guide);
  package READMEs replaced (were stock NestJS/Next boilerplate).
- **Known debt (pre-existing):** 2 failing backend tests (compare spec
  expectation drift; prices spec mock missing `allowDiskUse`), ~230 lint
  errors repo-wide. CI (`ci.yml`: typecheck+lint+test+build) is red.

---

## 2026-10-29 — Phase 16 Complete + Phase 15 Code-Complete

- **16.4 Manual price updates:** new admin Prices page (`/admin/prices`) —
  URL-driven search + pagination, create form with debounced device
  picker, inline edit (device not reassignable, matches UpdatePriceDto),
  delete with confirm; `getPrices()` added to the API client; sidebar link.
- **15.3 Price comparison widget fixes:** best-deal is now judged **per
  currency** (seeded data is USD-normalized; raw cross-currency sorting
  crowned wrong winners once mixed currencies exist), shared `formatPrice`
  formatting, "Last updated" reflects the most recent offer, `rel="sponsored"`
  on Buy Now, "No Link" replaces the misleading "Out of Stock".
- **API client honesty:** `getDevicePriceHistory` actually called the
  current-offers endpoint — renamed `getDeviceCurrentPrices`, added a real
  history method; all call sites updated.
- **15.2 Affiliate link generator:** `lib/affiliate.ts` (platform
  templates — no invented tracking schemes) + `AffiliateLinkGenerator`
  component in DeviceForm's affiliate tab; IDs remembered in localStorage;
  fixed a stale-state bug in the apply handler.
- **15.1 verified as already scaffolded:** AdSense script gate +
  `AdUnit` component + 4 placements existed.
- **Infra:** root `pnpm-workspace.yaml` `allowBuilds` filled in (bcrypt +
  unrs-resolver build, telemetry scripts denied) — deps now install.
- **Verified:** 27/27 frontend tests (4 new widget tests), backend
  unchanged 62/64, frontend production build green.

---

## 2026-01-25 — Smart Sync & Backend Crash Fixes

- **Smart Sync Strategy:** Database existence checks (skips API calls for existing devices), session limits capping Deep Sync to 5 fetches/session, 5s throttling between API hits.
- **Bug Fixes:** "Cast to string failed" (brand name extraction), swapped API transformers for Primary/Secondary providers, database collision in categories/brands collection.
- **Next step:** Clean rebuild (`pnpm run build`) and verify sync.

---

## 2026-01-23 — 3-Tier API Redundancy & Fill Gaps Enrichment

- **3-Tier Architecture:** Primary: Phone Specs Explorer, Secondary: GSMArena Parser, Tertiary: Mobile Phones2.
- **Fill Gaps logic:** Only populates missing fields on existing devices (preserves manual edits). Added "Force Update" flag. Standardized slug as unique identifier.
- **Admin UI:** "Sync Settings" card with provider checkboxes and "Force Update" toggle.
- **Next step:** Verify "Sync Settings" UI in Admin Panel.

---

## 2026-01-22 — Secondary API Replaced with Mobile Phones2

- Updated `.env` and `ExternalApiService.ts` for `mobile-phones2.p.rapidapi.com`.
- Implemented transformation logic for `spotlight` and `all_specs` data.
- Verified mapping with standalone script (`verify_lite.js`) — Result: SUCCESS.
- Primary API reverted to original path parameters format.
- **Next step:** Verify system stability.

---

## 2026-01-10 — Phase 17: Comprehensive Automated Testing

- **Backend:** Unit tests for `CategoriesService`, `PricesService`, `CompareService`, `CategoriesController` using Jest.
- **Frontend:** Component tests for `DeviceForm` and `AdminDevicesPage` using Vitest + RTL.
- **E2E:** Playwright configured with local Chrome. `user-flow.spec.ts` (search, device details, compare) and `admin-flow.spec.ts` (login, dashboard).
- **Next step:** Proceed to Phase 18: Deployment.

---

## 2026-01-05 — Search, Layout & Build Errors

- Search 500 error fixed by switching from `$text` to regex search in `DevicesRepository`.
- Logo replaced with professional white-text SVG for blue header.
- "Parsing ecmascript source code failed" in `PriceComparison.tsx` fixed (syntax + relative import paths).
- Admin credentials provided: `admin@gsmhub.com` / `admin123`.
- Admin login redirect loop fixed by adding `credentials: 'include'` and fixing session state.
- "Parsing ecmascript source code failed" in `BrandsPage.tsx` fixed (broken JSX tags, `triggerSync` -> `syncDevices`).

---

## 2026-01-03 — Frontend Build & Runtime Errors

- `next.config.ts` whitelisted `fdn2.gsmarena.com` for image loading.
- `themeColor` warnings fixed by moving to `viewport` export (Next.js 14+ requirement).

---

## 2026-01-03 — JWT Cookie Migration & Code Stabilization

- **Auth security:** Migrated JWT storage to HttpOnly cookies. Added `logout` endpoint. Updated `JwtStrategy` to extract token from cookies.
- **Frontend:** Refactored `ApiClient` for `credentials: 'include'`. Removed manual `localStorage` token storage from `AuthContext` and `api.ts`.
- **Bug fixes:** Resolved code corruption in `[slug]/page.tsx` and `ComparisonTable.tsx`. Fixed duplicate method signatures in `ApiClient`. Standardized `PriceHistory` type across shared library and frontend.
- **Next step:** Proceed to Phase 17 (Automated Testing).

---

## 2025-12-30 — Comprehensive Codebase Audit & Critical Fixes

- **Security:** Fixed Regex Injection (ReDoS) via shared `escapeRegExp` utility. Removed unsafe JWT secret/MongoDB URI fallbacks (now throws if env vars missing). Restricted CORS to specific frontend domain in production.
- **Performance:** Fixed N+1 query in device listing with bulk price fetcher. Increased Redis cache limits to 10000 items / 1hr TTL. Added DB indexes on `Device.views`, `Device.category`, `Device.createdAt`, and `PriceHistory({device: 1, date: -1})`.
- **Architecture:** Direct `GET /categories/id/:id` endpoint. Changed default backend port to `3001` (from `3000`). Updated `ApiClient` fallback accordingly.
- **Next step:** Phase 15 (Monetization) or Phase 17 (Testing).

---

## 2026-01-02 — Phase 15: Monetization (AdSense & Affiliate)

- **AdSense:** Reusable `AdUnit` component with environment-based script injection. Placed in Home (top banner), Device Details (sidebar + mid-content), Categories (bottom), Comparison (top).
- **PriceComparison:** Multi-retailer pricing with "Buy Now" affiliate buttons and "Best Deal" highlighting.
- **Next step:** Phase 17 (Automated Testing).

---

## 2025-12-27 — Redundant API Strategy & Universal Data Mapping

- Integrated GSMArena Parser (Primary) and Mobile Device Hardware Specs (Secondary) with automatic failover via RapidAPI headers.
- Universal transformer maps all fields regardless of provider — zero data loss.
- Resolved circular dependencies between `DevicesModule` and `ExternalApiModule` using `forwardRef`.
- **Next step:** Phase 15: Monetization.

---

## 2025-12-29 — Comprehensive Admin Search System

- Global `AdminGlobalSearch` in header with debounced real-time results.
- Search bars on Categories and Brands management pages with regex backend support.
- Standardized search bar aesthetics across all admin tables.

---

## 2025-12-28 — Brand Management & Dashboard Analytics

- **Revenue Dashboard:** Recharts AreaChart (Ads vs Affiliate) and PieChart (vendor performance).
- **Search History:** Persistent via `localStorage`, with delete/clear options.
- **SEO & Affiliates Manager:** `DeviceForm.tsx` "SEO & Affiliates" tab with `seoTitle`, `seoDescription`, `affiliateLinks[]`.
- **Bulk Import:** CSV upload via `apiClient.bulkImportDevices` with success/failure summary.
- **Audit Logs:** 30-second auto-refresh + expandable JSON payloads.

---

## 2025-12-27 — Advanced Form UX & Contrast Finalization

- `DeviceForm` upgraded with custom `DropdownInput` for OS, Brand, Display Size, Chipset, etc. (searchable, database-populated, manual-entry allowed).
- Accessibility final pass: all critical labels changed to high-contrast `text-gray-900` / `text-gray-800`.

---

## 2025-12-26 — Dynamic Suggestions & Text Accessibility

- Backend `/devices/suggestions` endpoint returns unique DB values for all key fields.
- Frontend `DeviceForm` uses HTML5 `<datalist>` for autocomplete on all input fields.
- Full text contrast audit across Admin and Public views.

---

## 2025-12-25 — Admin Panel Forms (Devices & Categories)

- Tabbed `DeviceForm` interface (General / Key Specs / Detailed Specs / Media).
- Image preview, auto-slug generation, `isActive` toggle for categories.
- Updated `Device` and `Category` schemas with all new fields and DTOs.

---

## 2025-12-24 — OpenGraph Fix & Shared Slug Utility

- Fixed "Invalid OpenGraph type: product" runtime error by changing OG type to `website` in `frontend/src/lib/seo.ts`.
- Created `shared/src/utils/slug.ts` for centralized slug generation. Refactored backend to use shared implementation.
- `DeviceForm` auto-generates URL-friendly slugs from device names.

---

## 2025-12-23 — Category Visibility, Deletion & Update Validation

- Added `@Expose()` to `CategoryResponseDto` and `DeviceResponseDto` fields (fixed invisible categories from NestJS serialization stripping).
- Updated forms to only send allowed fields (fixed `BadRequestException: property id should not exist`).
- Server-side duplicate name/slug checks in `CategoriesService` and `DevicesService`.

---

## 2025-12-23 — Phase 16: Admin Panel Core Infrastructure

- **Backend:** `UsersModule` (Mongoose schema), `AuthModule` (Passport JWT + Local strategy), bcrypt hashing. Default admin seeded: `admin@gsmhub.com` / `admin123`.
- **Frontend:** `AuthContext` (JWT in localStorage), `AdminLayout` (sidebar + auth guards), `AdminLoginPage`, `AdminDashboard`, `AdminDevicesPage`.
- Restructured `RootLayout` with `ClientLayout` to hide public Header/Footer on admin routes.
- **Next step:** Add/Edit Device forms and Category management.

---

## 2025-12-21 — SEO Optimization (Phase 14)

- `frontend/src/lib/seo.ts` for centralized metadata and JSON-LD.
- Dynamic SEO titles/descriptions + JSON-LD Product schema for device pages.
- Dynamic `robots.txt` and `sitemap.xml` covering devices, categories, brands.

---

## 2025-12-20 — Home Page Redesign (GSMArena Style)

- 3-column responsive layout: Left sidebar (Phone Finder + popular brands), Center (Hero + Categories + Latest Devices), Right sidebar (Top 10 by Daily Interest).

---

## 2025-12-13 — Frontend TypeScript & API Client

- Verified `Device`, `Category`, `SearchResult`, `PriceHistory` interfaces in `shared/src/types/index.ts`.
- Enhanced `ApiClient` error handling with API-specific error parsing.

---

## 2025-12-06 — Search Functionality Debug

- Fixed "params is a Promise" error in `DevicePage` (Next.js 14+ async params).
- Fixed backend 500 from circular dependency (Mongoose `Device` with nested `Category` causing `RangeError: Maximum call stack`). Solution: separate `CategoryResponseDto`.
- Fixed "Property 'specs' forEach is not a function" — legacy DB data stored specs as `Object` not `Array`. Frontend `SpecsTable` now normalizes both formats.
- Added `.lean()` to `DevicesRepository.findBySlug` to return plain JS objects.

---

## 2025-12-03 — Backend Startup Fix

- "Cannot find module 'dist/main'" resolved by updating `start:prod` to point to correct nested entry (`dist/backend/src/main`).
- Changed `build` script from `nest build` to `tsc` to handle monorepo path aliases.
- Updated `start:dev` to use `ts-node-dev` with `tsconfig-paths/register`.

---

## 2025-12-04 — Frontend Compilation Errors

- Added `name: string` and `_id?: string` to `Device` interface in `shared/src/types/index.ts`.
- Fixed `SpecsTable.tsx` spec grouping to correctly handle `DeviceSpec[]` -> `{[category: string]: {[key: string]: string}}`.
