import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ExternalApiService } from './external-api.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DevicesService } from '@modules/devices/devices.service';
import { CategoriesService } from '@modules/categories/categories.service';
import { Category } from '@modules/categories/category.schema';

@Injectable()
export class SyncService implements OnModuleInit {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly externalApiService: ExternalApiService,
    private readonly devicesService: DevicesService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async onModuleInit() {
    // Optionally trigger initial sync on application start
    // await this.initialDataLoad();
  }

  // Cron job for periodic incremental sync
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.debug('Called by cron job - Starting sync...');
    await this.fullSync();
  }

  async fullSync(): Promise<void> {
    this.logger.log('Starting full data sync from external API...');
    try {
      const brands = await this.fetchAndSaveBrands();
      await this.fetchAndSavePhonesByBrand(brands);
      this.logger.log('Full sync completed successfully.');
    } catch (error) {
      this.logger.error('Full sync failed:', error.stack);
    }
  }

  private async fetchAndSaveBrands(): Promise<string[]> {
    this.logger.log('Fetching brands...');
    const brands = await this.externalApiService.fetchAvailableBrands();
    const savedBrands: string[] = [];

    for (const brandName of brands) {
      // Upsert Category (Brand)
      try {
        await this.categoriesService.upsertCategory({ name: brandName });
        savedBrands.push(brandName);
      } catch (e) {
        this.logger.warn(`Failed to upsert brand ${brandName}: ${e.message}`);
      }
    }
    this.logger.log(`Fetched and saved ${savedBrands.length} brands.`);
    return savedBrands;
  }

  private async fetchAndSavePhonesByBrand(brands: string[]): Promise<void> {
    this.logger.log('Fetching phones by brand...');
    for (const brand of brands) {
      this.logger.log(`Fetching phones for brand: ${brand}`);
      
      try {
        const devices = await this.externalApiService.fetchDevicesByBrand(brand);
        
        for (const devicePartial of devices) {
          // Ensure category is set
          devicePartial.category = brand;
          
          // Upsert Device (Catalog info only)
          await this.devicesService.upsertDevice(devicePartial);
        }
        
        this.logger.log(`Saved ${devices.length} devices for ${brand}`);
        
        // Rate limit protection: Sleep 1s between brands
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        this.logger.error(`Failed to fetch/save devices for brand ${brand}: ${error.message}`);
      }
    }
    this.logger.log('Finished fetching and saving phones by brand.');
  }
}
