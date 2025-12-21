import { MetadataRoute } from 'next';
import { apiClient } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gsmhub.com';

  // Base routes
  const routes = ['', '/devices', '/categories', '/brands', '/compare', '/search'].map(
    (route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    })
  );

  try {
    // Fetch all devices for sitemap
    const { devices } = await apiClient.getDevices({ limit: 1000 });
    const deviceEntries = devices.map((device) => ({
      url: `${SITE_URL}/devices/${device.slug}`,
      lastModified: new Date(device.updatedAt || device.createdAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Fetch categories
    const categories = await apiClient.getCategories();
    const categoryEntries = categories.map((category) => ({
      url: `${SITE_URL}/categories/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Fetch brands
    const brands = await apiClient.getBrands();
    const brandEntries = brands.map((brand) => ({
      url: `${SITE_URL}/brands/${encodeURIComponent(brand)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...routes, ...deviceEntries, ...categoryEntries, ...brandEntries];
  } catch (error) {
    console.error('Sitemap generation failed:', error);
    return routes;
  }
}
