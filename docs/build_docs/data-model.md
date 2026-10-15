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
| `country` | string | |
| `retailer` | string | |
| `price` | number | |
| `currency` | string | |

## User (Admin)

| Field | Type |
|-------|------|
| `email` | string |
| `password` | string (bcrypt hash) |
| `name` | string |
| `role` | string |

## SearchIndex

- Populated from devices.
- Auto-indexing on device create/update.
- Supports fuzzy search (regex/text combo) with popularity weighting.

## Key Indexes

- `Device.views`, `Device.category`, `Device.createdAt`
- `PriceHistory({device: 1, date: -1})` — compound, for fast price lookups
