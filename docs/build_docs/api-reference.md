# GSMHub Backend API Reference

Internal backend API endpoints exposed by the NestJS server (default port **3001**).

---

## Devices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/devices` | List all devices (with filters + pagination) |
| GET | `/devices/slug/:slug` | Get single device by slug |
| GET | `/devices/category/:category` | Devices in a category |
| GET | `/devices/brand/:brand` | Devices by brand |
| GET | `/devices/popular` | Popular devices |
| GET | `/devices/trending` | Trending devices |
| GET | `/devices/suggestions` | Unique DB values for form autocomplete |
| POST | `/devices` | Create device (admin only) |
| PATCH | `/devices/:id` | Update device (admin only) |
| DELETE | `/devices/:id` | Delete device (admin only) |

## Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List all categories |
| GET | `/categories/id/:id` | Get category by ID |
| GET | `/categories/:slug` | Get category details |
| GET | `/categories/:slug/devices` | Devices in category |
| POST | `/categories` | Create (admin only) |
| PATCH | `/categories/:id` | Update (admin only) |
| DELETE | `/categories/:id` | Delete (admin only) |

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

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/prices/device/:slug` | Current prices for device |
| GET | `/prices/device/:slug/history` | Price history |
| POST | `/prices` | Add new price |
| PATCH | `/prices/:id` | Update price |

## Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login (sets HttpOnly cookie) |
| POST | `/auth/logout` | Logout (clears cookie) |
| GET | `/auth/profile` | Get current user profile |

## External API / Sync

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/external-api/sync/all` | Trigger full data sync |
| GET | `/devices/suggestions` | Unique values for form autocomplete |

## Brands

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/brands` | List all brands |

## Notes

- All responses are serialized through DTOs with `@Expose()` — only whitelisted fields are returned.
- CORS is restricted to the frontend domain in production.
- Rate limiting and global exception filters are active.
