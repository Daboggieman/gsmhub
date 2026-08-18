import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  forwardRef,
} from '@nestjs/common';
import * as fs from 'fs';
import csv from 'csv-parser';
import { Logger } from '@nestjs/common';
import { Readable } from 'stream';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Device, DeviceDocument } from './device.schema';
import { Category, CategoryDocument } from '../categories/category.schema';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DevicesRepository } from './devices.repository';
import {
  Category as SharedCategory,
  Device as SharedDevice,
  DeviceType,
} from '@shared/types';
import { CategoriesService } from '../categories/categories.service';
import { PricesService } from '../prices/prices.service';
import { ExternalApiService } from '../external-api/external-api.service';
import type { Cache } from 'cache-manager';

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly devicesRepository: DevicesRepository,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    private readonly categoriesService: CategoriesService,
    private readonly pricesService: PricesService,
    private readonly externalApiService: ExternalApiService,
  ) {}

  private async attachLatestPrice(device: Device): Promise<Device> {
    if (device && device._id) {
      const latestPrice = await this.pricesService.findLatestPriceByDeviceId(
        device._id.toString(),
      );
      if (latestPrice) {
        (device as any).latestPrice = latestPrice.price;
      }
    }
    return device;
  }

  private async attachLatestPrices(devices: Device[]): Promise<Device[]> {
    if (!devices.length) return devices;

    const deviceIds = devices
      .filter((d) => d && d._id)
      .map((d) => d._id!.toString());

    if (!deviceIds.length) return devices;

    const priceMap =
      await this.pricesService.findLatestPricesByDeviceIds(deviceIds);

    return devices.map((device) => {
      if (device && device._id && priceMap[device._id.toString()]) {
        (device as any).latestPrice = priceMap[device._id.toString()];
      }
      return device;
    });
  }

  async getAllDevices(filters?: {
    skip?: number;
    limit?: number;
    category?: string;
    brand?: string;
    search?: string;
    sort?: string;
    minRam?: number;
    maxRam?: number;
    minStorage?: number;
    maxStorage?: number;
    minBattery?: number;
    maxBattery?: number;
    minDisplay?: number;
    maxDisplay?: number;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<{ devices: Device[]; total: number; suggestions?: string[] }> {
    if (filters?.category && !Types.ObjectId.isValid(filters.category)) {
      throw new NotFoundException(`Invalid Category ID: ${filters.category}`);
    }
    const devices = await this.devicesRepository.findAll(filters);
    const total = await this.devicesRepository.countAll(filters);
    const devicesWithPrices = await this.attachLatestPrices(devices);

    let suggestions: string[] = [];
    if (total === 0 && filters?.search) {
      suggestions = await this.findSearchSuggestions(filters.search);
    }

    return { devices: devicesWithPrices, total, suggestions };
  }

  private async findSearchSuggestions(query: string): Promise<string[]> {
    const brands = await this.getBrands();
    const suggestions: string[] = [];

    // Check if query is close to any brand names
    const lowerQuery = query.toLowerCase();
    for (const brand of brands) {
      if (
        brand.toLowerCase().includes(lowerQuery) ||
        lowerQuery.includes(brand.toLowerCase())
      ) {
        suggestions.push(brand);
      }
    }

    // Limit suggestions to 5
    return suggestions.slice(0, 5);
  }

  async findOne(id: string): Promise<Device> {
    const device = await this.devicesRepository.findOne(id);
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }
    return await this.attachLatestPrice(device);
  }

  async findBySlug(slug: string): Promise<Device> {
    const cachedDevice = await this.cacheManager.get<Device>(`device_${slug}`);
    if (cachedDevice) {
      return await this.attachLatestPrice(cachedDevice);
    }

    const device = await this.devicesRepository.findBySlug(slug);
    if (!device) {
      throw new NotFoundException(`Device with slug ${slug} not found`);
    }
    const deviceWithPrice = await this.attachLatestPrice(device);
    await this.cacheManager.set(`device_${slug}`, deviceWithPrice, 3600); // Cache for 1 hour
    return deviceWithPrice;
  }

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    const { category: categoryId, slug, ...deviceData } = createDeviceDto;

    // Check for existing slug
    const existing = await this.devicesRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictException('Device with this slug already exists');
    }

    let category: CategoryDocument | null = null;
    if (categoryId) {
      if (!Types.ObjectId.isValid(categoryId)) {
        throw new NotFoundException(`Invalid Category ID: ${categoryId}`);
      }
      category = await this.categoryModel.findById(categoryId).exec();
      if (!category) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }
    }

    const newDeviceData: Partial<Device> = {
      ...deviceData,
      slug,
      category: category ? (category._id as any) : undefined,
    };

    const newDevice = await this.devicesRepository.create(newDeviceData);
    await this.cacheManager.del('popular_devices');
    return newDevice;
  }

  async update(id: string, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    const { category: categoryId, slug, ...deviceData } = updateDeviceDto;

    // Check for slug conflict if slug is being updated
    if (slug) {
      const existing = await this.devicesRepository.findBySlug(slug);
      if (existing && existing._id?.toString() !== id) {
        throw new ConflictException(
          'Another device with this slug already exists',
        );
      }
    }

    const updatePayload: Partial<Device> = { ...deviceData, slug };

    if (categoryId) {
      if (!Types.ObjectId.isValid(categoryId)) {
        throw new NotFoundException(`Invalid Category ID: ${categoryId}`);
      }
      const categoryDoc = await this.categoryModel.findById(categoryId).exec();
      if (!categoryDoc) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }
      updatePayload.category = categoryDoc._id as any;
    } else if (
      updateDeviceDto.hasOwnProperty('category') &&
      categoryId === null
    ) {
      updatePayload.category = null as any;
    }

    const updatedDevice = await this.devicesRepository.update(
      id,
      updatePayload,
    );

    if (!updatedDevice) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    await this.cacheManager.del(`device_${updatedDevice.slug}`);
    await this.cacheManager.del('popular_devices');
    return updatedDevice;
  }

  async remove(id: string): Promise<void> {
    const deletedDevice = await this.devicesRepository.remove(id);
    if (!deletedDevice) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }
    await this.cacheManager.del(`device_${deletedDevice.slug}`);
    await this.cacheManager.del('popular_devices');
  }

  async getPopularDevices(limit: number): Promise<Device[]> {
    const cachedPopularDevices = await this.cacheManager.get<Device[]>(
      `popular_devices_${limit}`,
    );
    if (cachedPopularDevices) {
      return await this.attachLatestPrices(cachedPopularDevices);
    }

    const popularDevices = await this.devicesRepository.findPopular(limit);
    const popularDevicesWithPrices =
      await this.attachLatestPrices(popularDevices);
    await this.cacheManager.set(
      `popular_devices_${limit}`,
      popularDevicesWithPrices,
      3600,
    ); // Cache for 1 hour
    return popularDevicesWithPrices;
  }

  async getTrendingDevices(limit: number): Promise<Device[]> {
    const trendingDevices = await this.devicesRepository.findTrending(limit);
    return await this.attachLatestPrices(trendingDevices);
  }

  async getDevicesByCategory(
    category: string,
    limit: number,
  ): Promise<Device[]> {
    if (!Types.ObjectId.isValid(category)) {
      throw new NotFoundException(`Invalid Category ID: ${category}`);
    }
    const devices = await this.devicesRepository.findByCategory(
      category,
      limit,
    );
    return await this.attachLatestPrices(devices);
  }

  async getDevicesByBrand(brand: string, limit: number): Promise<Device[]> {
    const devices = await this.devicesRepository.findByBrand(brand, limit);
    return await this.attachLatestPrices(devices);
  }

  async increaseViewCount(slug: string): Promise<Device> {
    const device = await this.devicesRepository.incrementViewCount(slug);
    if (!device) {
      throw new NotFoundException(`Device with slug ${slug} not found`);
    }
    await this.cacheManager.del(`device_${slug}`);
    await this.cacheManager.del('popular_devices');
    return device;
  }

  async upsertDevice(
    deviceData: Partial<SharedDevice>,
    options: { forceUpdate?: boolean } = {},
  ): Promise<Device | null> {
    if (!deviceData.slug) {
      throw new Error('Device slug is required for upsert operation.');
    }

    // Check if device already exists
    const existingDevice = await this.devicesRepository.findBySlug(
      deviceData.slug,
    );

    if (existingDevice && !options.forceUpdate) {
      this.logger.log(
        `Device ${deviceData.slug} already exists. Filling gaps...`,
      );

      const updatePayload: any = {};
      const fieldsToEnrich = [
        'description',
        'releaseDate',
        'dimension',
        'os',
        'storage',
        'displaySize',
        'ram',
        'battery',
        'chipset',
        'imageUrl',
      ];

      fieldsToEnrich.forEach((field) => {
        if (!existingDevice[field] && deviceData[field]) {
          updatePayload[field] = deviceData[field];
        }
      });

      // Enrich specs (add missing specs by key)
      if (deviceData.specs && deviceData.specs.length > 0) {
        const existingSpecKeys = new Set(
          existingDevice.specs?.map((s) => s.key) || [],
        );
        const newSpecs = deviceData.specs.filter(
          (s) => !existingSpecKeys.has(s.key),
        );
        if (newSpecs.length > 0) {
          updatePayload.specs = [...(existingDevice.specs || []), ...newSpecs];
        }
      }

      if (Object.keys(updatePayload).length > 0) {
        return await this.devicesRepository.update(
          existingDevice._id!.toString(),
          updatePayload,
        );
      }

      return existingDevice as Device;
    }

    // Default category to 'Smartphones' if missing
    if (!deviceData.category) {
      deviceData.category = 'Smartphones';
    }

    // Find or create category
    const categoryName = deviceData.category; // Assuming deviceData.category comes as category name or slug
    let categoryDocument = await this.categoryModel
      .findOne({
        $or: [{ name: categoryName }, { slug: categoryName }],
      })
      .exec();

    if (!categoryDocument) {
      const newCategoryData: Partial<SharedCategory> = {
        name: categoryName,
        slug: categoryName, // Assuming slug is same as name for simplicity, can be generated
      };
      categoryDocument = (await this.categoriesService.upsertCategory(
        newCategoryData,
      )) as any;
    }

    const preparedDeviceData: Partial<Device> = {
      ...deviceData,
      category: categoryDocument!._id as any, // Assign the ObjectId of the category, non-null assertion
      model: deviceData.model || deviceData.slug, // Ensure model is present, fallback to slug
      views: deviceData.views || 0,
      isActive: deviceData.isActive ?? true,
      imageUrl: deviceData.imageUrl,
      description: deviceData.description,
      releaseDate: deviceData.releaseDate,
      dimension: deviceData.dimension,
      os: deviceData.os,
      storage: deviceData.storage,
      displaySize: deviceData.displaySize,
      ram: deviceData.ram,
      battery: deviceData.battery,
      specs: deviceData.specs,
      // createdAt and updatedAt will be handled by Mongoose timestamps
    };

    const upsertedDevice =
      await this.devicesRepository.upsert(preparedDeviceData);
    if (upsertedDevice) {
      await this.cacheManager.del(`device_${upsertedDevice.slug}`);
      await this.cacheManager.del('popular_devices');
      return await this.attachLatestPrice(upsertedDevice);
    }
    return null;
  }

  async syncDeviceFromAPI(
    brand: string,
    model: string,
    options: { providers?: string[]; forceUpdate?: boolean } = {},
  ): Promise<Device | null> {
    try {
      const deviceData = await this.externalApiService.fetchDeviceSpecs(
        brand,
        model,
        options.providers,
      );
      if (!deviceData) {
        throw new NotFoundException(
          `Device ${brand} ${model} not found in selected external APIs`,
        );
      }
      return await this.upsertDevice(deviceData, {
        forceUpdate: options.forceUpdate,
      });
    } catch (error) {
      throw new NotFoundException(`Failed to sync device: ${error.message}`);
    }
  }

  async getBrands(): Promise<string[]> {
    return this.devicesRepository.getUniqueBrands();
  }

  async getFieldSuggestions(): Promise<Record<string, string[]>> {
    const fields = [
      'os',
      'ram',
      'storage',
      'battery',
      'chipset',
      'networkTechnology',
      'displaySize',
      'colors',
      'mainCamera',
      'selfieCamera',
      'dimension',
    ];
    const suggestions: Record<string, string[]> = {};

    await Promise.all(
      fields.map(async (field) => {
        suggestions[field] =
          await this.devicesRepository.getUniqueFieldValues(field);
      }),
    );

    return suggestions;
  }

  async getTotalViews(): Promise<number> {
    return this.devicesRepository.getTotalViews();
  }

  async bulkImport(
    filePath: string,
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const results: any[] = [];
    const errors: string[] = [];
    let successCount = 0;
    let failedCount = 0;

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('error', (error) => {
          errors.push(`CSV Parsing Error: ${error.message}`);
          try { fs.unlinkSync(filePath); } catch { /* best-effort cleanup */ }
          resolve({ success: successCount, failed: failedCount, errors });
        })
        .on('end', async () => {
          for (const row of results) {
            try {
              // Map CSV columns to Device template if needed, or assume they match CreateDeviceDto
              // Example mapping for affiliateLinks and specs if they are JSON strings in CSV
              if (
                row.affiliateLinks &&
                typeof row.affiliateLinks === 'string'
              ) {
                try {
                  row.affiliateLinks = JSON.parse(row.affiliateLinks);
                } catch (e) {
                  row.affiliateLinks = [];
                }
              }
              if (row.specs && typeof row.specs === 'string') {
                try {
                  row.specs = JSON.parse(row.specs);
                } catch (e) {
                  row.specs = [];
                }
              }

              await this.upsertDevice(row);
              successCount++;
            } catch (error) {
              failedCount++;
              errors.push(
                `Failed to import ${row.name || 'Unknown'}: ${error.message}`,
              );
            }
          }
          // Clean up the temp file
          try { fs.unlinkSync(filePath); } catch { /* best-effort cleanup */ }
          resolve({ success: successCount, failed: failedCount, errors });
        });
    });
  }

  async findSimilar(id: string, limit: number = 5): Promise<Device[]> {
    const device = await this.findOne(id);
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    const price = device.latestPrice || 0;
    const categoryId = (device.category as any)?._id || device.category;

    const filters: any = {
      category: categoryId ? categoryId.toString() : undefined,
      limit,
    };

    if (price > 0) {
      filters.minPrice = price * 0.8;
      filters.maxPrice = price * 1.2;
    }

    let similarDevices = await this.devicesRepository.findAll(filters);

    // Filter out the current device
    similarDevices = similarDevices.filter((d) => d._id?.toString() !== id);

    // If we don't have enough similar devices by price, just get by category
    if (similarDevices.length < limit && categoryId) {
      const moreDevices = await this.devicesRepository.findAll({
        category: categoryId.toString(),
        limit: limit + 1, // Get one extra to account for potential exclusion
      });

      for (const d of moreDevices) {
        if (similarDevices.length >= limit) break;
        if (
          d._id?.toString() !== id &&
          !similarDevices.some((sd) => sd._id?.toString() === d._id?.toString())
        ) {
          similarDevices.push(d);
        }
      }
    }

    return await this.attachLatestPrices(similarDevices);
  }
}
