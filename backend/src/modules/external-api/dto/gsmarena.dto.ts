// gsmarena.dto.ts
// Interfaces for the GSM Arena API responses

export interface Brand {
  brand_id: string;
  brand_name: string;
  brand_slug: string;
  device_count: string;
  detail: string;
}

export interface PhoneListItem {
  brand: string;
  phone_name: string;
  slug: string;
  image: string;
  detail: string;
}

export interface LatestPhone {
  phone_name: string;
  slug: string;
  image: string;
  detail: string;
}

export interface TopByInterestPhone {
  phone_name: string;
  hits: string;
  slug: string;
  image: string;
  detail: string;
}

export interface TopByFansPhone {
  phone_name: string;
  fans: string;
  slug: string;
  image: string;
  detail: string;
}

export interface SearchResultPhone {
  phone_name: string;
  slug: string;
  image: string;
  detail: string;
}

export interface SpecDetail {
  title: string;
  specs: { key: string; val: string[] }[];
}

export interface PhoneSpec {
  brand: string;
  phone_name: string;
  thumbnail: string;
  phone_images: string[];
  release_date: string;
  dimension: string;
  os: string;
  storage: string;
  spec_detail: SpecDetail[];
}

export interface BrandListResponse {
  status: boolean;
  data: Brand[];
}

export interface PhoneListResponse {
  status: boolean;
  data: {
    title: string;
    phones: PhoneListItem[];
    current_page: number;
    last_page: number;
  };
}

export interface PhoneSpecResponse {
  status: boolean;
  data: PhoneSpec;
}

export interface SearchResponse {
  status: boolean;
  data: SearchResultPhone[];
}

export interface LatestPhonesResponse {
  status: boolean;
  data: LatestPhone[];
}

export interface TopByInterestResponse {
  status: boolean;
  data: TopByInterestPhone[];
}

export interface TopByFansResponse {
  status: boolean;
  data: TopByFansPhone[];
}
