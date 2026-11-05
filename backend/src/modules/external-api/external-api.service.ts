import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { classifyDeviceType } from '@shared/utils/device-class.util';
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

  async fetchAvailableBrands(): Promise<string[]> {
    const allBrandsSet = new Set<string>();

    try {
      const brands = await this.scraper.fetchBrands();
      brands.forEach((b) => allBrandsSet.add(b));
    } catch (e) {
      this.logger.warn(`GSMArena scraper brand fetch failed: ${e.message}`);
    }

    return Array.from(allBrandsSet);
  }

  // --- FETCH DEVICES BY BRAND ---

  async fetchDevicesByBrand(brandName: string): Promise<any[]> {
    let results: any[] = [];

    try {
      const items = await this.scraper.fetchDevicesByBrand(brandName);
      if (items.length > 0) {
        results = items.map((item) => ({
          model: item.name,
          brand: brandName,
          slug: generateSlug(item.name),
          rawSlug: item.slug, // GSMArena page slug for spec fetches
          // GSMArena brand listings mix phones, tablets and watches —
          // classify from the name (iPad / Tab / Watch / Buds …).
          type: classifyDeviceType(item.name),
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

    return results;
  }

  // --- FETCH DEVICE SPECS ---

  async fetchDeviceSpecs(
    brand: string,
    model: string,
    rawSlug?: string,
  ): Promise<any> {
    // Uses the raw GSMArena page slug captured during the device-list
    // scrape when available.
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

    throw new HttpException(
      'Device specifications not found in any selected provider',
      HttpStatus.NOT_FOUND,
    );
  }
}
