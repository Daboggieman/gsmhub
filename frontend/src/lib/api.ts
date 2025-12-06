import { Device, Category, SearchResult, PriceHistory } from '../../../shared/src/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Devices
  async getDevices(params?: {
    page?: number;
    limit?: number;
    category?: string;
    brand?: string;
    search?: string;
  }): Promise<{ devices: Device[]; total: number; page: number; limit: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.brand) queryParams.append('brand', params.brand);
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return this.request(`/devices${query ? `?${query}` : ''}`);
  }

  async getDevice(slug: string): Promise<Device> {
    return this.request(`/devices/slug/${slug}`);
  }

  async getPopularDevices(limit: number = 10): Promise<Device[]> {
    return this.request(`/devices/popular?limit=${limit}`);
  }

  async getTrendingDevices(limit: number = 10): Promise<Device[]> {
    return this.request(`/devices/trending?limit=${limit}`);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.request('/categories');
  }

  async getCategory(slug: string): Promise<Category> {
    return this.request(`/categories/${slug}`);
  }

  // Search
  async searchDevices(query: string): Promise<SearchResult[]> {
    return this.request(`/search?q=${encodeURIComponent(query)}`);
  }

  // Price History
  async getDevicePriceHistory(deviceId: number): Promise<PriceHistory[]> {
    return this.request(`/prices/device/${deviceId}`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
