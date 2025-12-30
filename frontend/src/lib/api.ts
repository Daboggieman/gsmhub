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
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    let modifiedOptions = options || {};
    
    modifiedOptions.headers = {
      'Content-Type': 'application/json',
      ...modifiedOptions.headers,
    };

    if (token) {
      modifiedOptions.headers = {
        ...modifiedOptions.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

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

    return response.json();
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

  async getDeviceById(id: string): Promise<Device> {
    return this.request(`/devices/${id}`);
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
    return this.request(`/compare?devices=${slugs.join(',')}`);
  }

  // Categories
  async getCategories(search?: string): Promise<Category[]> {
    return this.request(`/categories${search ? `?search=${encodeURIComponent(search)}` : ''}`);
  }

  async getCategory(slug: string): Promise<Category> {
    return this.request(`/categories/${slug}`);
  }

  async getCategoryById(id: string): Promise<Category> {
    const categories = await this.getCategories();
    return categories.find(c => c.id === id) as Category;
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

  // Price History
  async getDevicePriceHistory(deviceId: number): Promise<PriceHistory[]> {
    return this.request(`/prices/device/${deviceId}`);
  }

  // Admin
  async getAdminStats(): Promise<{ devicesCount: number; categoriesCount: number; totalViews: number }> {
    return this.request('/admin/stats');
  }

  // External API / Sync
  async triggerSync(brand?: string): Promise<{ message: string }> {
    if (brand) {
      return this.request(`/external-api/sync/brand/${encodeURIComponent(brand)}`, { method: 'POST' });
    }
    return this.request('/external-api/sync/all', { method: 'POST' });
  }
}


export const apiClient = new ApiClient(API_BASE_URL);
