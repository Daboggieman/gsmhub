import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Device, DeviceDocument } from './device.schema';
import { Category, CategoryDocument } from '../categories/category.schema';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DevicesRepository } from './devices.repository';
import { Category as SharedCategory, Device as SharedDevice, DeviceType } from '@shared/types';
import { CategoriesService } from '../categories/categories.service'; // Import CategoriesService

@Injectable()
export class DevicesService {
  constructor(
    private readonly devicesRepository: DevicesRepository,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    private readonly categoriesService: CategoriesService, // Inject CategoriesService
  ) {}

  async findAll(
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
    const device = await this.devicesRepository.findBySlug(slug);
    if (!device) {
      throw new NotFoundException(`Device with slug ${slug} not found`);
    }
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
      category: category ? category._id : undefined,
    };
    
    return this.devicesRepository.create(newDeviceData);
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

    return updatedDevice;
  }

  async remove(id: string): Promise<void> {
    const result = await this.devicesRepository.remove(id);
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }
  }

  async getPopularDevices(limit: number): Promise<Device[]> {
    return this.devicesRepository.findPopular(limit);
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
    return device;
  }

  async upsertDevice(deviceData: Partial<SharedDevice>): Promise<Device> {
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
      // If category doesn't exist, create it. Using the shared Category interface for partial data.
      // Need to define a category in the shared types.
      const newCategoryData: Partial<SharedCategory> = {
        name: categoryName,
        slug: categoryName, // Assuming slug is same as name for simplicity, can be generated
      };
      categoryDocument = await this.categoriesService.upsertCategory(newCategoryData);
    }

    const preparedDeviceData: Partial<Device> = {
      ...deviceData,
      category: categoryDocument._id, // Assign the ObjectId of the category
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

    return this.devicesRepository.upsert(preparedDeviceData);
  }
}
