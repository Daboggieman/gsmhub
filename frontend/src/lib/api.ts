import { Device, Category, SearchResult, PriceHistory } from '../../../shared/src/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class ApiClient {
  private baseURL: string;
  private requestInterceptors: ((request: RequestInit) => RequestInit | Promise<RequestInit>)[] = [];
  private responseInterceptors: ((response: Response) => Response | Promise<Response>)[] = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  public addRequestInterceptor(interceptor: (request: RequestInit) => RequestInit | Promise<RequestInit>) {
    this.requestInterceptors.push(interceptor);
  }

  public addResponseInterceptor(interceptor: (response: Response) => Response | Promise<Response>) {
    this.responseInterceptors.push(interceptor);
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    let modifiedOptions = options || {};
    for (const interceptor of this.requestInterceptors) {
      modifiedOptions = await Promise.resolve(interceptor(modifiedOptions));
    }

    const url = `${this.baseURL}${endpoint}`;
    let response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...modifiedOptions?.headers,
      },
      ...modifiedOptions,
    });

    for (const interceptor of this.responseInterceptors) {
      response = await Promise.resolve(interceptor(response));
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `API request failed: ${response.statusText}`);
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
    sort?: string;
  }): Promise<{ devices: Device[]; total: number; page: number; limit: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.brand) queryParams.append('brand', params.brand);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sort) queryParams.append('sort', params.sort);

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

  async getBrands(): Promise<string[]> {
    return this.request('/devices/brands');
  }

  async compareDevices(slugs: string[]): Promise<any> {
    return this.request(`/compare?devices=${slugs.join(',')}`);
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
