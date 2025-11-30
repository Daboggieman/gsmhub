export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface Device {
  id: number;
  slug: string;
  brand: string;
  model: string;
  category_id: number;
  image_url?: string;
  specs: any; // Or a more specific type based on your specs JSON structure
  views: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PriceHistory {
  id: number;
  device_id: number;
  country: string;
  price: number;
  currency: string;
  retailer?: string;
  affiliate_url?: string;
  date: string;
}

export interface SearchResult {
  id: number;
  name: string;
  slug: string;
  brand: string;
  category?: string;
}
