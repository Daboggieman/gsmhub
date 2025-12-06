import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Device, DeviceDocument } from './device.schema';
import { Category, CategoryDocument } from '../categories/category.schema';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DevicesRepository } from './devices.repository';
import { Category as SharedCategory, Device as SharedDevice, DeviceType } from '@shared/types';
import { CategoriesService } from '../categories/categories.service'; // Import CategoriesService
import { Cache } from 'cache-manager';

@Injectable()
export class DevicesService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly devicesRepository: DevicesRepository,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    private readonly categoriesService: CategoriesService, // Inject CategoriesService
  ) {}

  async getAllDevices(
    filters?: { skip?: number; limit?: number; category?: string; brand?: string; search?: string }
  ): Promise<Device[]> {
    if (filters?.category && !Types.ObjectId.isValid(filters.category)) {
      throw new NotFoundException(`Invalid Category ID: ${filters.category}`);
    }
    return this.devicesRepository.findAll(filters);
  }

  async findOne(id: string): Promise<Device> {
    const device = await this.devicesRepository.findOne(id);
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }
    return device;
  }
  
  async findBySlug(slug: string): Promise<Device> {
    const cachedDevice = await this.cacheManager.get<Device>(`device_${slug}`);
    if (cachedDevice) {
      return cachedDevice;
    }

    const device = await this.devicesRepository.findBySlug(slug);
    if (!device) {
      throw new NotFoundException(`Device with slug ${slug} not found`);
    }
    await this.cacheManager.set(`device_${slug}`, device, 3600); // Cache for 1 hour
    return device;
  }

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    const { category: categoryId, ...deviceData } = createDeviceDto;

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
      category: category ? (category._id as any) : undefined,
    };
    
    const newDevice = await this.devicesRepository.create(newDeviceData);
    await this.cacheManager.del('popular_devices');
    return newDevice;
  }

  async update(id: string, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    const { category: categoryId, ...deviceData } = updateDeviceDto;

    const updatePayload: Partial<Device> = { ...deviceData };

    if (categoryId) {
      if (!Types.ObjectId.isValid(categoryId)) {
        throw new NotFoundException(`Invalid Category ID: ${categoryId}`);
      }
      const categoryDoc = await this.categoryModel.findById(categoryId).exec();
      if (!categoryDoc) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }
      updatePayload.category = categoryDoc._id as any;
    } else if (updateDeviceDto.hasOwnProperty('category') && categoryId === null) {
      updatePayload.category = null as any;
    }

    const updatedDevice = await this.devicesRepository.update(id, updatePayload);

    if (!updatedDevice) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    await this.cacheManager.del(`device_${updatedDevice.slug}`);
    await this.cacheManager.del('popular_devices');
    return updatedDevice;
  }

  async remove(id: string): Promise<void> {
    const device = await this.devicesRepository.findOne(id);
    if (device) {
      await this.cacheManager.del(`device_${device.slug}`);
      await this.cacheManager.del('popular_devices');
      const result = await this.devicesRepository.remove(id);
      if (result.deletedCount === 0) {
        throw new NotFoundException(`Device with ID ${id} not found`);
      }
    }
  }

  async getPopularDevices(limit: number): Promise<Device[]> {
    const cachedPopularDevices = await this.cacheManager.get<Device[]>(`popular_devices_${limit}`);
    if (cachedPopularDevices) {
      return cachedPopularDevices;
    }

    const popularDevices = await this.devicesRepository.findPopular(limit);
    await this.cacheManager.set(`popular_devices_${limit}`, popularDevices, 3600); // Cache for 1 hour
    return popularDevices;
  }

  async getTrendingDevices(limit: number): Promise<Device[]> {
    return this.devicesRepository.findTrending(limit);
  }

  async getDevicesByCategory(category: string, limit: number): Promise<Device[]> {
    if (!Types.ObjectId.isValid(category)) {
      throw new NotFoundException(`Invalid Category ID: ${category}`);
    }
    return this.devicesRepository.findByCategory(category, limit);
  }

  async getDevicesByBrand(brand: string, limit: number): Promise<Device[]> {
    return this.devicesRepository.findByBrand(brand, limit);
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

  async upsertDevice(deviceData: Partial<SharedDevice>): Promise<Device | null> {
    if (!deviceData.slug) {
      throw new Error('Device slug is required for upsert operation.');
    }
    if (!deviceData.category) {
      throw new Error('Device category is required for upsert operation.');
    }

    // Find or create category
    const categoryName = deviceData.category; // Assuming deviceData.category comes as category name or slug
    let categoryDocument = await this.categoryModel.findOne({
      $or: [{ name: categoryName }, { slug: categoryName }],
    }).exec();

    if (!categoryDocument) {
      const newCategoryData: Partial<SharedCategory> = {
        name: categoryName,
        slug: categoryName, // Assuming slug is same as name for simplicity, can be generated
      };
      categoryDocument = await this.categoriesService.upsertCategory(newCategoryData) as any;
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

    const upsertedDevice = await this.devicesRepository.upsert(preparedDeviceData);
    if(upsertedDevice) {
      await this.cacheManager.del(`device_${upsertedDevice.slug}`);
      await this.cacheManager.del('popular_devices');
    }
    return upsertedDevice;
  }

  async syncDeviceFromAPI(deviceData: Partial<SharedDevice>): Promise<Device | null> {
    // This method will leverage the existing upsertDevice method to handle the actual syncing logic.
    // It serves as an entry point for an external API call and uses upsertDevice to persist the data.
    return this.upsertDevice(deviceData);
  }
}