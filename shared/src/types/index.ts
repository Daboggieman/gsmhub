export interface Category {
  id?: string; // MongoDB _id
  name: string;
  slug: string;
  description?: string;
}

export enum DeviceType {
  PHONE = 'PHONE',
  TABLET = 'TABLET',
  LAPTOP = 'LAPTOP',
  SMARTWATCH = 'SMARTWATCH',
  ACCESSORY = 'ACCESSORY',
  OTHER = 'OTHER',
}

export interface DeviceSpec {
  category: string;
  key: string;
  value: string;
}

export interface Device {
  _id?: string; // MongoDB _id (optional for creation, assigned by DB)
  slug: string;
  brand: string;
  model: string;
  name: string;
  category: string; // Category ID as string, will be ObjectId in DB
  imageUrl?: string;
  description?: string; // Optional
  images?: string[]; // Array of image URLs
  releaseDate?: string;
  dimension?: string;
  os?: string;
  storage?: string;
  displaySize?: string;
  ram?: string;
  battery?: string;
  specs: DeviceSpec[];
  views: number;
  isActive: boolean; // Renamed from is_active for consistency
  createdAt?: string;
  updatedAt?: string;
  type: DeviceType;
}

export interface PriceHistory {
  id?: string; // MongoDB _id
  deviceId: string; // Device ID as string
  country: string;
  price: number;
  currency: string;
  retailer?: string;
  affiliateUrl?: string; // Renamed from affiliate_url
  date: string;
}

export interface SearchResult {
  id: string; // MongoDB _id
  name: string;
  slug: string;
  brand: string;
  category?: string;
}
