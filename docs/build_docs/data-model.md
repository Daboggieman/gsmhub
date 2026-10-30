# Data Model Reference

MongoDB schemas (Mongoose) used by the GSMHub backend.

---

## Device

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Serialized as string in DTOs |
| `slug` | string | Unique identifier for matching |
| `name` | string | Device name |
| `brand` | ref Brand | |
| `category` | ref Category | Indexed |
| `images` | string[] | Array of image URLs |
| `type` | string | Device type |
| `specs` | [DeviceSpec] | Array of spec objects (NOT object — legacy data may differ) |
| `views` | number | Indexed, used for popularity |
| `isActive` | boolean | Visibility toggle |
| `affiliateLinks` | [{platform, url, price?}] | Retailer links shown as "Buy on {platform}" buttons |
| `createdAt` | Date | Indexed |

## DeviceSpec (embedded)

| Field | Type |
|-------|------|
| `category` | string |
| `key` | string |
| `value` | string |

## Category

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Unique |
| `slug` | string | Unique |
| `icon` | string | |
| `description` | string | |
| `isActive` | boolean | Visibility toggle |

## Brand

| Field | Type |
|-------|------|
| `name` | string |
| `slug` | string |

## PriceHistory

| Field | Type | Notes |
|-------|------|-------|
| `device` | ref Device | Compound index `{device: 1, date: -1}` |
| `date` | Date | Indexed (compound with device) |
| `country` | string | Seed rows use `Global` |
| `retailer` | string | Seed rows use `Official Store` |
| `price` | number | Seed rows are USD-normalized (see below) |
| `currency` | string | Seed rows are `USD` |
| `affiliateUrl` | string | Retailer link — powers the widget's "Buy Now" |

**Seed convention:** `seed-prices.ts` normalizes the PhoneDB launch price
to USD (`price` = USD amount, `currency` = `'USD'`), keeping the original
launch currency only in the resolution logic. Manually added entries may
use any currency — the price comparison widget therefore groups best-deal
selection **per currency** and never compares raw amounts across
currencies.

## User (Admin)

| Field | Type | Notes |
|-------|------|-------|
| `email` | string | Unique |
| `password` | string | bcrypt hash |
| `name` | string | |
| `role` | string | `admin` \| `user` |
| `isActive` | boolean | Deactivation guard for self |

## SearchIndex

- Populated from devices.
- Auto-indexing on device create/update.
- Supports fuzzy search (regex/text combo) with popularity weighting.

## Key Indexes

- `Device.views`, `Device.category`, `Device.createdAt`
- `PriceHistory({device: 1, date: -1})` — compound, for fast price lookups
