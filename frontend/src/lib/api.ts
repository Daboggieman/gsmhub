import { Device, Category, SearchResult, PriceHistory } from '@shared/types';

// Browser requests go to the same origin ("/api") so auth cookies stay
// first-party (Safari/Brave block third-party cookies); next.config.ts
// proxies "/api/:path*" to the backend via BACKEND_URL.
// Server-side (SSR) requests call the backend directly and need no cookies,
// so they use the absolute BACKEND_URL.
// NEXT_PUBLIC_API_URL (inlined at build time) remains as a legacy override
// for the browser — leave it unset in deployments.
export const API_BASE_URL = typeof window === 'undefined'
  ? (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')
  : (process.env.NEXT_PUBLIC_API_URL || '/api');

class ApiClient {
  private baseURL: string;
  private requestInterceptors: ((request: RequestInit) => RequestInit | Promise<RequestInit>)[] = [];
  private responseInterceptors: ((response: Response) => Response | Promise<Response>)[] = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async getProfile(): Promise<any> {
    return this.request('/auth/profile');
  }

  public addRequestInterceptor(interceptor: (request: RequestInit) => RequestInit | Promise<RequestInit>) {
    this.requestInterceptors.push(interceptor);
  }

  public addResponseInterceptor(interceptor: (response: Response) => Response | Promise<Response>) {
    this.responseInterceptors.push(interceptor);
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    let modifiedOptions = options || {};

    modifiedOptions.headers = { ...modifiedOptions.headers };

    if (!(modifiedOptions.body instanceof FormData)) {
      modifiedOptions.headers = {
        'Content-Type': 'application/json',
        ...modifiedOptions.headers,
      };
    }

    modifiedOptions.credentials = 'include';

    for (const interceptor of this.requestInterceptors) {
      modifiedOptions = await Promise.resolve(interceptor(modifiedOptions));
    }

    const url = `${this.baseURL}${endpoint}`;
    let response = await fetch(url, modifiedOptions);

    for (const interceptor of this.responseInterceptors) {
      response = await Promise.resolve(interceptor(response));
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `API request failed: ${response.statusText}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return {} as T;
  }

  // Devices
  async deleteDevice(id: string): Promise<void> {
    return this.request(`/devices/${id}`, { method: 'DELETE' });
  }

  async createDevice(data: any): Promise<Device> {
    return this.request('/devices', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateDevice(id: string, data: any): Promise<Device> {
    return this.request(`/devices/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async getDevices(params?: {
    page?: number;
    limit?: number;
    category?: string;
    brand?: string;
    search?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    minRam?: number;
    maxRam?: number;
    minStorage?: number;
    maxStorage?: number;
    minBattery?: number;
    maxBattery?: number;
    minDisplay?: number;
    maxDisplay?: number;
  }): Promise<{ devices: Device[]; total: number; page: number; limit: number; totalPages: number; suggestions?: string[] }> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.brand) queryParams.append('brand', params.brand);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sort) queryParams.append('sort', params.sort);

    // Advanced Filters
    if (params?.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params?.minRam !== undefined) queryParams.append('minRam', params.minRam.toString());
    if (params?.maxRam !== undefined) queryParams.append('maxRam', params.maxRam.toString());
    if (params?.minStorage !== undefined) queryParams.append('minStorage', params.minStorage.toString());
    if (params?.maxStorage !== undefined) queryParams.append('maxStorage', params.maxStorage.toString());
    if (params?.minBattery !== undefined) queryParams.append('minBattery', params.minBattery.toString());
    if (params?.maxBattery !== undefined) queryParams.append('maxBattery', params.maxBattery.toString());
    if (params?.minDisplay !== undefined) queryParams.append('minDisplay', params.minDisplay.toString());
    if (params?.maxDisplay !== undefined) queryParams.append('maxDisplay', params.maxDisplay.toString());

    const query = queryParams.toString();
    return this.request(`/devices${query ? `?${query}` : ''}`);
  }

  async getDevice(slug: string): Promise<Device> {
    return this.request(`/devices/slug/${slug}`);
  }

  async getDeviceById(id: string): Promise<Device> {
    return this.request(`/devices/${id}`);
  }

  async getPopularDevices(limit: number = 10): Promise<Device[]> {
    return this.request(`/devices/popular?limit=${limit}`);
  }

  async getTrendingDevices(limit: number = 10): Promise<Device[]> {
    return this.request(`/devices/trending?limit=${limit}`);
  }

  async getSimilarDevices(id: string, limit: number = 5): Promise<Device[]> {
    return this.request(`/devices/${id}/similar?limit=${limit}`);
  }

  async bulkImportDevices(file: File): Promise<{ success: number; failed: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);

    // We need to bypass the default JSON Content-Type for FormData
    const options: RequestInit = {
      method: 'POST',
      body: formData,
      headers: {}, // Let the browser set the boundary
    };

    return this.request('/devices/bulk-import', options);
  }

  async getBrands(): Promise<string[]> {
    return this.request('/devices/brands');
  }

  async getAdminBrands(search?: string): Promise<any[]> {
    return this.request(`/brands${search ? `?search=${encodeURIComponent(search)}` : ''}`);
  }

  async createBrand(data: any): Promise<any> {
    return this.request('/brands', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateBrand(id: string, data: any): Promise<any> {
    return this.request(`/brands/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteBrand(id: string): Promise<void> {
    return this.request(`/brands/${id}`, { method: 'DELETE' });
  }

  async getFieldSuggestions(): Promise<Record<string, string[]>> {
    return this.request('/devices/suggestions');
  }

  async compareDevices(slugs: string[]): Promise<any> {
    const data = await this.request<any>(`/compare?devices=${slugs.join(',')}`);
    if (data && data.message && !data.comparison) {
      throw new Error(data.message);
    }
    return data;
  }

  // Categories
  async getCategories(search?: string): Promise<Category[]> {
    return this.request(`/categories${search ? `?search=${encodeURIComponent(search)}` : ''}`);
  }

  async getCategory(slug: string): Promise<Category> {
    return this.request(`/categories/${slug}`);
  }

  async getCategoryById(id: string): Promise<Category> {
    return this.request(`/categories/id/${id}`);
  }

  async deleteCategory(id: string): Promise<void> {
    return this.request(`/categories/${id}`, { method: 'DELETE' });
  }

  async createCategory(data: any): Promise<Category> {
    return this.request('/categories', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateCategory(id: string, data: any): Promise<Category> {
    return this.request(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  // Search
  async searchDevices(query: string): Promise<SearchResult[]> {
    return this.request(`/search?q=${encodeURIComponent(query)}`);
  }

  // Prices — latest offer per country/retailer for a device
  // (backend route: GET /prices/device/:id → PricesService.getCurrentPrices)
  async getDeviceCurrentPrices(deviceId: string): Promise<PriceHistory[]> {
    return this.request(`/prices/device/${deviceId}`);
  }

  // Full chronological history for a device
  async getDevicePriceHistory(deviceId: string): Promise<PriceHistory[]> {
    return this.request(`/prices/device/${deviceId}/history`);
  }

  // Admin
  async getAdminStats(): Promise<any> {
    return this.request('/admin/stats');
  }

  // Users
  async toggleFavorite(deviceId: string): Promise<{ isFavorited: boolean }> {
    return this.request(`/users/favorites/${deviceId}`, { method: 'POST' });
  }

  async getFavorites(): Promise<Device[]> {
    return this.request('/users/favorites');
  }

  async getAuditLogs(params: { page?: number; limit?: number; userId?: string; action?: string; targetType?: string }): Promise<{ logs: any[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.userId) searchParams.set('userId', params.userId);
    if (params.action) searchParams.set('action', params.action);
    if (params.targetType) searchParams.set('targetType', params.targetType);

    return this.request(`/admin/audit-logs?${searchParams.toString()}`);
  }

  // External API / Sync
  async syncDevices(brand?: string, options: { providers?: string[]; forceUpdate?: boolean } = {}): Promise<any> {
    if (brand) {
      return this.request(`/external-api/sync/brand/${encodeURIComponent(brand)}`, { 
        method: 'POST',
        body: JSON.stringify(options)
      });
    }
    return this.request('/external-api/sync/all', { 
      method: 'POST',
      body: JSON.stringify(options)
    });
  }

  async syncDevice(brand: string, model: string, options: { providers?: string[]; forceUpdate?: boolean } = {}): Promise<any> {
    return this.request('/devices/sync', { 
      method: 'POST', 
      body: JSON.stringify({ brand, model, ...options }) 
    });
  }

  // Prices
  async getPrices(params: { page?: number; limit?: number; search?: string }): Promise<{ prices: any[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);

    return this.request(`/prices?${searchParams.toString()}`);
  }

  async createPrice(data: any): Promise<PriceHistory> {
    return this.request('/prices', { method: 'POST', body: JSON.stringify(data) });
  }

  async updatePrice(id: string, data: any): Promise<PriceHistory> {
    return this.request(`/prices/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deletePrice(id: string): Promise<void> {
    return this.request(`/prices/${id}`, { method: 'DELETE' });
  }

  // Users (admin)
  async getUsers(params: { page?: number; limit?: number; search?: string }): Promise<{ users: any[]; total: number; page: number; limit: number; totalPages: number }> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);

    return this.request(`/users?${searchParams.toString()}`);
  }

  async createUser(data: { name: string; email: string; password: string; role?: string }): Promise<any> {
    return this.request('/users', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateUser(id: string, data: any): Promise<any> {
    return this.request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request(`/users/${id}`, { method: 'DELETE' });
  }
}


export const apiClient = new ApiClient(API_BASE_URL);
