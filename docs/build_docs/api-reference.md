# GSMHub Backend API Reference

Internal backend API endpoints exposed by the NestJS server (default port **3001**).

Public routes require no auth. Routes marked **admin** require the
HttpOnly `auth_token` cookie (JWT) plus the `admin` role.

---

## Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health/live` | Liveness probe (always returns if process is up) |
| GET | `/health/ready` | Readiness — 503 unless MongoDB is connected |

## Devices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/devices` | List devices (filters, pagination, `search`, `sort`) |
| GET | `/devices/slug/:slug` | Get single device by slug |
| GET | `/devices/category/:category` | Devices in a category |
| GET | `/devices/brand/:brand` | Devices by brand |
| GET | `/devices/popular` | Popular devices |
| GET | `/devices/trending` | Trending devices |
| GET | `/devices/brands` | Distinct brand list |
| GET | `/devices/suggestions` | Unique DB values for form autocomplete |
| GET | `/devices/:id/similar` | Similar devices |
| POST | `/devices` | Create device (admin) |
| PATCH | `/devices/:id` | Update device (admin) |
| DELETE | `/devices/:id` | Delete device (admin) |
| POST | `/devices/sync` | Sync one device from external providers (admin) |
| POST | `/devices/bulk-import` | CSV bulk import, multipart field `file` (admin) |

## Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List all categories |
| GET | `/categories/id/:id` | Get category by ID |
| GET | `/categories/:slug` | Get category details |
| GET | `/categories/:slug/devices` | Devices in category |
| POST | `/categories` | Create (admin) |
| PATCH | `/categories/:id` | Update (admin) |
| DELETE | `/categories/:id` | Delete (admin) |

## Brands

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/brands` | List all brands |
| POST | `/brands` | Create (admin) |
| PATCH | `/brands/:id` | Update (admin) |
| DELETE | `/brands/:id` | Delete (admin) |

## Search

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/search?q=query` | Main search |
| GET | `/search/autocomplete?q=query` | Autocomplete |
| GET | `/search/suggestions?q=query` | Suggestions |

## Compare

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/compare?devices=slug1,slug2` | Side-by-side comparison |

## Prices

`GET /prices/device/:id` returns the **latest offer per country/retailer
combination** (what the price comparison widget displays);
`GET /prices/device/:id/history` returns the full chronological history.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/prices` | Paginated list, `?page&limit&search` (joins device name/brand) |
| GET | `/prices/:id` | Single price entry |
| GET | `/prices/device/:deviceId` | Latest offer per country/retailer |
| GET | `/prices/device/:deviceId/history` | Full history |
| GET | `/prices/device/:deviceId/trend` | Latest price trend (up/down/stable + %) |
| POST | `/prices` | Add price entry (admin) |
| PATCH | `/prices/:id` | Update price entry (admin) — device cannot be reassigned |
| DELETE | `/prices/:id` | Delete price entry (admin) |

All price mutations are captured automatically by the global audit-log
interceptor (action `POST_PRICES` / `PATCH_PRICES` / `DELETE_PRICES`).

## Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login (sets HttpOnly `auth_token` cookie) |
| POST | `/auth/logout` | Logout (clears cookie) |
| GET | `/auth/profile` | Get current user profile |

Cookie flags: `secure` in production, `sameSite` from `COOKIE_SAME_SITE`
(default `lax`), `domain` from `COOKIE_DOMAIN` (usually unset — the
frontend proxies API calls same-origin, so cookies stay first-party).

## Users (admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Paginated list, `?page&limit&search` |
| POST | `/users` | Create user |
| PATCH | `/users/:id` | Update (role, isActive); self-modification guarded |
| DELETE | `/users/:id` | Delete; self-deletion guarded |

## Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/stats` | Dashboard analytics (popular devices, searches, system stats) |
| GET | `/admin/audit-logs` | Audit log, `?page&limit&userId&action&targetType` |

## External API / Sync

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/external-api/sync/all` | Trigger full data sync (admin) |
| POST | `/external-api/sync/brand/:brand` | Sync one brand (admin) |

## Notes

- All responses are serialized through DTOs with `@Expose()` — only whitelisted fields are returned.
- CORS is restricted to `FRONTEND_URL` (comma-separated origins accepted; bare hostnames get `https://` prepended). Under the standard deployment the browser never calls the API directly — the frontend proxies `/api/*` — so CORS is a fallback, not the main path.
- Rate limiting and global exception filters are active.
- All admin write operations are recorded in the audit log by the global interceptor (passwords/tokens scrubbed).
