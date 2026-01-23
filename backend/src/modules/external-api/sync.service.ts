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

  async fullSync(
    options: { providers?: string[]; forceUpdate?: boolean } = {},
  ): Promise<void> {
    this.logger.log('Starting full data sync from external API...');
    try {
      const brands = await this.fetchAndSaveBrands(options.providers);
      // For full sync, we might want to do a deep sync for each brand
      await this.fetchAndSavePhonesByBrand(brands, true, options);
      this.logger.log('Full sync completed successfully.');
    } catch (error) {
      this.logger.error('Full sync failed:', error.stack);
    }
  }

  private async fetchAndSaveBrands(providers?: string[]): Promise<string[]> {
    this.logger.log('Fetching brands...');
    const brands =
      await this.externalApiService.fetchAvailableBrands(providers);
    const savedBrands: string[] = [];

    for (const brandName of brands) {
      // Upsert Category (Brand)
      try {
        await this.categoriesService.upsertCategory({
          name: brandName,
          slug: generateSlug(brandName),
        });
        savedBrands.push(brandName);
      } catch (e) {
        this.logger.warn(`Failed to upsert brand ${brandName}: ${e.message}`);
      }
    }
    this.logger.log(`Fetched and saved ${savedBrands.length} brands.`);
    return savedBrands;
  }

  async fetchAndSavePhonesByBrand(
    brands: string[],
    deepSync: boolean = false,
    options: { providers?: string[]; forceUpdate?: boolean } = {},
  ): Promise<void> {
    this.logger.log(`Fetching phones by brand... DeepSync: ${deepSync}`);
    for (const brand of brands) {
      this.logger.log(`Fetching phones for brand: ${brand}`);

      try {
        const devices = await this.externalApiService.fetchDevicesByBrand(
          brand,
          options.providers,
        );

        this.logger.log(
          `Found ${devices.length} devices for ${brand}. Syncing detailed data...`,
        );

        for (const devicePartial of devices) {
          try {
            if (deepSync) {
              // Fetch full specs for each device
              this.logger.debug(
                `Deep syncing specs for ${brand} ${devicePartial.model}...`,
              );
              const fullDevice = await this.externalApiService.fetchDeviceSpecs(
                brand,
                devicePartial.model,
                options.providers,
              );
              if (fullDevice) {
                fullDevice.category = brand;
                await this.devicesService.upsertDevice(fullDevice, {
                  forceUpdate: options.forceUpdate,
                });
              }
            } else {
              // Catalog info only
              devicePartial.category = brand;
              await this.devicesService.upsertDevice(devicePartial, {
                forceUpdate: options.forceUpdate,
              });
            }
          } catch (deviceError) {
            this.logger.warn(
              `Failed to sync device ${devicePartial.model}: ${deviceError.message}`,
            );
          }
        }

        this.logger.log(
          `Successfully processed ${devices.length} devices for ${brand}`,
        );

        // Rate limit protection: Sleep 1s between brands
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        this.logger.error(
          `Failed to fetch/save devices for brand ${brand}: ${error.message}`,
        );
      }
    }
    this.logger.log('Finished fetching and saving phones by brand.');
  }
}

import { generateSlug } from '../../common/utils/slug.util';
