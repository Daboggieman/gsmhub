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
| Categories | `/admin/categories` | Category CRUD |
| Brands | `/admin/brands` | Brand management |
| Audit Logs | `/admin/audit` | Change history with expandable JSON |

## Device Management

### Adding / Editing Devices
- Tabbed form: General, Key Specs, Detailed Specs, Media.
- Fields support **searchable dropdowns** (`DropdownInput`) populated from the database — you can also type custom values.
- Auto-generates URL-friendly slugs from device names.
- Image preview for primary device image.

### SEO & Affiliates Tab
- Set `seoTitle`, `seoDescription`.
- Add multiple affiliate links (retailer name + URL + price), e.g. Jumia, Amazon.

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
