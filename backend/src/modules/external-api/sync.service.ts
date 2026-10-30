import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
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
    @Optional() private readonly brandsService?: BrandsService,
  ) {}

  async onModuleInit() {
    // Optionally trigger initial sync on application start
    // await this.initialDataLoad();
  }

  // Weekly full refresh: every Sunday at 03:00. Pulls new devices from
  // GSMArena into the DB; existing devices are gap-filled, never overwritten.
  @Cron('0 3 * * 0')
  async handleCron() {
    this.logger.debug('Weekly sync triggered - refreshing data...');
    await this.fullSync({ providers: ['gsma'], forceUpdate: false });
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
        if (this.brandsService) {
          await this.brandsService.upsertBrand({
            name: brandName,
            slug: generateSlug(brandName),
          });
        } else {
          await this.categoriesService.upsertCategory({
            name: brandName,
            slug: generateSlug(brandName),
          });
        }
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
    options: {
      providers?: string[];
      forceUpdate?: boolean;
      fullSeed?: boolean;
    } = {},
  ): Promise<void> {
    this.logger.log(
      `Fetching phones by brand... DeepSync: ${deepSync}, fullSeed: ${options.fullSeed}`,
    );

    let deepSyncCount = 0;
    const DEEP_SYNC_BATCH_LIMIT = options.fullSeed
      ? 999_999 // one-time seed: no cap
      : 200; // weekly cron: 200 devices/specs per run

    for (const brand of brands) {
      this.logger.log(`Fetching phones for brand: ${brand}`);

      try {
        const devices = options.providers
          ? await this.externalApiService.fetchDevicesByBrand(
              brand,
              options.providers,
            )
          : await this.externalApiService.fetchDevicesByBrand(brand);

        this.logger.log(
          `Found ${devices.length} devices for ${brand}. Syncing detailed data...`,
        );

        for (const devicePartial of devices) {
          const slug =
            devicePartial.slug ||
            generateSlug(`${brand} ${devicePartial.model}`);

          // Always upsert — upsertDevice() handles existing-vs-new logic internally.
          // forceUpdate=true = overwrite all fields; forceUpdate=false = gap-fill only.
          try {
            if (
              deepSync &&
              typeof this.externalApiService.fetchDeviceSpecs === 'function'
            ) {
              if (deepSyncCount >= DEEP_SYNC_BATCH_LIMIT) {
                this.logger.warn(
                  `Deep sync batch limit (${DEEP_SYNC_BATCH_LIMIT}) reached. Skipping detailed fetch for remaining devices in this session.`,
                );
                // Still upsert partial if it doesn't exist
                devicePartial.category = brand;
                await this.devicesService.upsertDevice(devicePartial, options);
                continue;
              }

              this.logger.debug(
                `Deep syncing specs for ${brand} ${devicePartial.model}...`,
              );

              // Rate-limit delay only in weekly cron (not in fullSeed mode)
              if (!options.fullSeed) {
                await this.sleep(5000);
              }

              const fullDevice = await this.externalApiService.fetchDeviceSpecs(
                brand,
                devicePartial.model,
                options.providers,
                devicePartial.rawSlug,
              );
              if (fullDevice) {
                fullDevice.category = brand;
                await this.devicesService.upsertDevice(fullDevice, options);
                deepSyncCount++;
              } else {
                devicePartial.category = brand;
                await this.devicesService.upsertDevice(devicePartial, options);
              }
            } else {
              // Catalog info only (no deep-spec fetch)
              devicePartial.category = brand;
              await this.devicesService.upsertDevice(devicePartial, options);
            }
          } catch (deviceError) {
            this.logger.warn(
              `Failed to sync device ${devicePartial.model}: ${deviceError.message}`,
            );
          }
        }

        // Brand-level rate limit (skipped in fullSeed)
        if (!options.fullSeed) {
          await this.sleep(2000);
        }
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
