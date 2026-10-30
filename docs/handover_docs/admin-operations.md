# Admin Panel Guide

How to use the GSMHub Admin Panel for day-to-day content management.

---

## Access

- **URL:** `/admin/login`
- **Default credentials:** `admin@gsmhub.com` / `admin123`
- Auth uses JWT stored in HttpOnly cookies (secure against XSS token theft).

## Pages

| Page | Path | Purpose |
|------|------|---------|
| Login | `/admin/login` | Credential entry |
| Dashboard | `/admin/dashboard` | Stats, charts, live monitoring |
| Devices | `/admin/devices` | Device CRUD, bulk import, sync |
| Prices | `/admin/prices` | Manual price entry management across all devices |
| Categories | `/admin/categories` | Category CRUD |
| Brands | `/admin/brands` | Brand management |
| Users | `/admin/users` | Admin/user accounts, roles, activation |
| Audit Logs | `/admin/audit-logs` | Change history with expandable JSON |

## Device Management

### Adding / Editing Devices
- Tabbed form: General, Key Specs, Detailed Specs, Media.
- Fields support **searchable dropdowns** (`DropdownInput`) populated from the database — you can also type custom values.
- Auto-generates URL-friendly slugs from device names.
- Image preview for primary device image.

### SEO & Affiliates Tab
- Set `seoTitle`, `seoDescription`.
- Add multiple affiliate links (retailer name + URL + price), e.g. Jumia, Amazon.
- **Affiliate Link Generator:** each link row has a "Generate" button that
  builds a tracked URL from the device name (Amazon `tag=`, Jumia,
  Flipkart, Google Shopping). Your affiliate ID per platform is remembered
  in the browser (localStorage) — enter it once.

## Price Management

- Central list of all price entries across devices with search +
  pagination (`/admin/prices`).
- **Add Price:** pick the device via the search picker, then amount,
  currency, country, retailer, and optional affiliate URL. Currency and
  country are free-text with suggestions (USD, EUR, NGN, KES, …).
- **Edit:** inline; the device cannot be reassigned (delete + re-add if
  needed).
- **Delete:** with confirmation.
- Every create/update/delete is recorded in Audit Logs automatically.
- Note the seed convention: seeded rows are USD-normalized; mixed
  currencies are handled by the public widget (best-deal per currency), but
  avoid mixing currencies within one market/retailer.

### Bulk Import
- "Bulk Import" button on the Devices list page.
- Upload a CSV; a success/failure summary is shown after import.

### Sync Settings
- Provider checkboxes (Primary / Secondary / Tertiary).
- "Force Update" toggle to overwrite existing fields (careful — overrides manual edits).
- Click "Sync" to trigger.

## Dashboard Analytics

- Revenue Analytics (AreaChart): Ads vs Affiliate trends (Recharts).
- Vendor Performance (PieChart): click distribution by retailer.
- Audit logs with 30-second live auto-refresh and expandable rows.

## Search

- **Global Admin Search** in the header — instant device access from any admin page.
- **Local page search** on Categories, Brands, and Devices tables.
- Search is regex-based on the backend with debounced frontend requests.

## Tips

- Category and Device slugs must be unique — the backend rejects duplicates.
- When editing, only allowed fields are sent to the API (extra fields are stripped to avoid validation errors).
- Devices use soft-delete preference where possible.
