export interface Category {
    id?: string;
    name: string;
    slug: string;
    description?: string;
}
export declare enum DeviceType {
    PHONE = "PHONE",
    TABLET = "TABLET",
    LAPTOP = "LAPTOP",
    SMARTWATCH = "SMARTWATCH",
    ACCESSORY = "ACCESSORY",
    OTHER = "OTHER"
}
export interface DeviceSpec {
    category: string;
    key: string;
    value: string;
}
export interface Device {
    id?: string;
    slug: string;
    brand: string;
    model: string;
    category: string;
    imageUrl?: string;
    description?: string;
    images?: string[];
    releaseDate?: string;
    dimension?: string;
    os?: string;
    storage?: string;
    displaySize?: string;
    ram?: string;
    battery?: string;
    specs: DeviceSpec[];
    views: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
    type: DeviceType;
}
export interface PriceHistory {
    id?: string;
    deviceId: string;
    country: string;
    price: number;
    currency: string;
    retailer?: string;
    affiliateUrl?: string;
    date: string;
}
export interface SearchResult {
    id: string;
    name: string;
    slug: string;
    brand: string;
    category?: string;
}
