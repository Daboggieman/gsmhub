import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ExternalApiService } from './external-api.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DevicesService } from '@modules/devices/devices.service';
import { CategoriesService } from '@modules/categories/categories.service';
import { Category } from '@modules/categories/category.schema';
import { BrandsService } from '@modules/brands/brands.service';

@Injectable()
export class SyncService implements OnModuleInit {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly externalApiService: ExternalApiService,
    private readonly devicesService: DevicesService,
    private readonly categoriesService: CategoriesService,
    private readonly brandsService: BrandsService,
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
      if (typeof brandName !== 'string' || !brandName.trim()) {
        this.logger.warn(
          `Skipping invalid brand entry: ${JSON.stringify(brandName)}`,
        );
        continue;
      }
      try {
        await this.brandsService.upsertBrand({
          name: brandName,
          slug: generateSlug(brandName),
        });
        savedBrands.push(brandName);
      } catch (e) {
        this.logger.warn(`Failed to upsert brand ${brandName}: ${e.message}`);
      }
    }
    this.logger.log(
      `Fetched and saved ${savedBrands.length} brands (to Brands collection).`,
    );
    return savedBrands;
  }

  private async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async fetchAndSavePhonesByBrand(
    brands: string[],
    deepSync: boolean = false,
    options: { providers?: string[]; forceUpdate?: boolean } = {},
  ): Promise<void> {
    this.logger.log(`Fetching phones by brand... DeepSync: ${deepSync}`);

    let deepSyncCount = 0;
    const SESSION_DEEP_SYNC_LIMIT = 5; // To preserve monthly quota

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
          const slug =
            devicePartial.slug ||
            generateSlug(`${brand} ${devicePartial.model}`);

          // SMART CHECK: Skip if exists and not forceUpdate
          if (!options.forceUpdate) {
            const existing = await this.devicesService
              .findBySlug(slug)
              .catch(() => null);
            if (existing) {
              this.logger.debug(`Skipping existing device: ${slug}`);
              continue;
            }
          }

          try {
            if (deepSync) {
              if (deepSyncCount >= SESSION_DEEP_SYNC_LIMIT) {
                this.logger.warn(
                  `Deep sync limit reached for this session (${SESSION_DEEP_SYNC_LIMIT}). Skipping detailed fetch for ${devicePartial.model}.`,
                );
                // Still upsert the partial if it doesn't exist
                devicePartial.category = brand;
                await this.devicesService.upsertDevice(devicePartial, options);
                continue;
              }

              this.logger.debug(
                `Deep syncing specs for ${brand} ${devicePartial.model}...`,
              );

              // RATE LIMIT PROTECTION: 5s delay before ANY detail fetch
              await this.sleep(5000);

              const fullDevice = await this.externalApiService.fetchDeviceSpecs(
                brand,
                devicePartial.model,
                options.providers,
              );
              if (fullDevice) {
                fullDevice.category = brand;
                await this.devicesService.upsertDevice(fullDevice, options);
                deepSyncCount++;
              }
            } else {
              // Catalog info only
              devicePartial.category = brand;
              await this.devicesService.upsertDevice(devicePartial, options);
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

        // Rate limit protection: Sleep 2s between brands
        await this.sleep(2000);
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
