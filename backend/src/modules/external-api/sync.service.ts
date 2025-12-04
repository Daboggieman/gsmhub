import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ExternalApiService } from './external-api.service';
import { DataTransformationService } from './data-transformation.service';
import { BrandListResponse, PhoneListResponse, PhoneSpecResponse } from '@modules/external-api/dto/gsmarena.dto';
import { Device, Category } from '@shared/types'; // Internal types
import { Cron, CronExpression } from '@nestjs/schedule'; // Import Cron and CronExpression
import { ConfigService } from '@nestjs/config';
import { DevicesService } from '@modules/devices/devices.service'; // Import DevicesService
import { CategoriesService } from '@modules/categories/categories.service'; // Import CategoriesService

@Injectable()
export class SyncService implements OnModuleInit {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly externalApiService: ExternalApiService,
    private readonly dataTransformationService: DataTransformationService,
    private readonly devicesService: DevicesService,
    private readonly categoriesService: CategoriesService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Optionally trigger initial sync on application start
    // await this.initialDataLoad();
  }

  // Cron job for periodic incremental sync
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // Default to daily at midnight, can be configured via env
  async handleCron() {
    this.logger.debug('Called by cron job - Starting incremental sync...');
    await this.incrementalSync();
  }

  async initialDataLoad(): Promise<void> {
    this.logger.log('Starting initial data load from external API...');
    try {
      const brands = await this.fetchAndSaveBrands();
      await this.fetchAndSavePhonesByBrand(brands);
      this.logger.log('Initial data load completed successfully.');
    } catch (error) {
      this.logger.error('Initial data load failed:', error.stack);
    }
  }

  async incrementalSync(): Promise<void> {
    this.logger.log('Starting incremental sync from external API...');
    try {
      // For a truly incremental sync, we would ideally:
      // 1. Fetch only new brands/phones or those updated since last sync.
      //    This requires the external API to support such queries (e.g., 'since' parameter).
      // 2. Compare fetched data with existing database entries and update only changed fields.

      // As a simplified approach for this API, we will re-fetch all data and upsert,
      // letting the upsert logic handle updates for existing records.
      const brands = await this.fetchAndSaveBrands();
      await this.fetchAndSavePhonesByBrand(brands);
      this.logger.log('Incremental sync completed successfully.');
    } catch (error) {
      this.logger.error('Incremental sync failed:', error.stack);
    }
  }

  private async fetchAndSaveBrands(): Promise<Category[]> {
    this.logger.log('Fetching brands...');
    const response = await this.externalApiService.get<BrandListResponse>('/brands');
    const externalBrands = response.data;
    const internalCategories: Category[] = [];

    for (const extBrand of externalBrands) {
      const category = this.dataTransformationService.transformBrand(extBrand); // Assuming transformBrand returns Category
      const savedCategory = await this.categoriesService.upsertCategory(category); // Assuming upsertCategory method
      internalCategories.push(savedCategory);
    }
    this.logger.log(`Fetched and saved ${internalCategories.length} brands.`);
    return internalCategories;
  }

  private async fetchAndSavePhonesByBrand(brands: Category[]): Promise<void> {
    this.logger.log('Fetching phones by brand...');
    for (const brand of brands) {
      this.logger.log(`Fetching phones for brand: ${brand.name}`);
      // Assuming a paginated endpoint for phones by brand slug
      let currentPage = 1;
      let lastPage = 1;

      do {
        const response = await this.externalApiService.get<PhoneListResponse>(
          `/brands/${brand.slug}?page=${currentPage}`,
        );
        const externalPhones = response.data.phones;
        lastPage = response.data.last_page; // Update last page from response

        for (const extPhone of externalPhones) {
          const partialDevice = this.dataTransformationService.transformPhoneListItemToDevice(extPhone);
          const fullPhoneSpec = await this.fetchAndSavePhoneSpec(extPhone.slug);
          if (fullPhoneSpec) {
            const device: Device = { ...partialDevice, ...fullPhoneSpec, brand: brand.name } as Device; // Merge partial with full spec
            await this.devicesService.upsertDevice(device); // Assuming upsertDevice method
          }
        }
        currentPage++;
      } while (currentPage <= lastPage);
    }
    this.logger.log('Finished fetching and saving phones by brand.');
  }

  private async fetchAndSavePhoneSpec(phoneSlug: string): Promise<Partial<Device> | null> {
    this.logger.log(`Fetching detailed specifications for phone slug: ${phoneSlug}`);
    try {
      const response = await this.externalApiService.get<PhoneSpecResponse>(`/${phoneSlug}`);
      const externalSpec = response.data;
      return this.dataTransformationService.normalizePhoneSpec(externalSpec);
    } catch (error) {
      this.logger.error(`Failed to fetch specs for ${phoneSlug}: ${error.message}`);
      return null;
    }
  }
}
