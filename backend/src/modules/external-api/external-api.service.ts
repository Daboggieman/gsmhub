import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { DeviceType } from '@shared/types';
import { generateSlug } from '../../common/utils/slug.util';
import { GsmarenaScraperService } from './gsmarena-scraper.service';

/**
 * Device-data source. The former RapidAPI providers (primary /
 * secondary / tertiary) were removed — all three listings are dead
 * (404) and the catalog is seeded from the PhoneDB dataset instead.
 * The free, keyless GSMArena scraper is the only remaining provider.
 */
@Injectable()
export class ExternalApiService {
  private readonly logger = new Logger(ExternalApiService.name);
  private readonly scraper: GsmarenaScraperService;

  constructor(scraper: GsmarenaScraperService) {
    this.scraper = scraper;
  }

  // --- FETCH BRANDS ---

  async fetchAvailableBrands(
    providers: string[] = ['gsma'],
  ): Promise<string[]> {
    const allBrandsSet = new Set<string>();

    // GSMArena scraper (free, no quota)
    if (providers.includes('gsma')) {
      try {
        const brands = await this.scraper.fetchBrands();
        brands.forEach((b) => allBrandsSet.add(b));
      } catch (e) {
        this.logger.warn(`GSMArena scraper brand fetch failed: ${e.message}`);
      }
    }

    return Array.from(allBrandsSet);
  }

  // --- FETCH DEVICES BY BRAND ---

  async fetchDevicesByBrand(
    brandName: string,
    providers: string[] = ['gsma'],
  ): Promise<any[]> {
    let results: any[] = [];

    // GSMArena scraper (free, no quota)
    if (providers.includes('gsma')) {
      try {
        const items = await this.scraper.fetchDevicesByBrand(brandName);
        if (items.length > 0) {
          results = items.map((item) => ({
            model: item.name,
            brand: brandName,
            slug: generateSlug(item.name),
            rawSlug: item.slug, // GSMArena page slug for spec fetches
            type: DeviceType.PHONE,
            isActive: true,
            specs: [],
            imageUrl: item.imageUrl || '',
          }));
        }
      } catch (e) {
        this.logger.warn(
          `GSMArena scraper device list failed for ${brandName}: ${e.message}`,
        );
      }
    }

    return results;
  }

  // --- FETCH DEVICE SPECS ---

  async fetchDeviceSpecs(
    brand: string,
    model: string,
    providers: string[] = ['gsma'],
    rawSlug?: string,
  ): Promise<any> {
    // GSMArena scraper (free, no quota) — uses the raw GSMArena page slug
    // captured during the device-list scrape when available.
    if (providers.includes('gsma')) {
      try {
        const gsmaDevice = rawSlug
          ? await this.scraper.fetchDeviceSpecs(rawSlug, brand, model)
          : await this.scraper.fetchSpecsByModel(brand, model);
        if (gsmaDevice) return gsmaDevice;
      } catch (e) {
        this.logger.warn(
          `GSMArena scraper specs failed for ${brand} ${model}: ${e.message}`,
        );
      }
    }

    throw new HttpException(
      'Device specifications not found in any selected provider',
      HttpStatus.NOT_FOUND,
    );
  }
}
