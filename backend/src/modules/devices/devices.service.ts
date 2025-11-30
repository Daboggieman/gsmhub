import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Device, DeviceDocument } from './device.schema';
import { Category, CategoryDocument } from '../categories/category.schema';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class DevicesService {
  constructor(
    @InjectModel(Device.name)
    private readonly deviceModel: Model<DeviceDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async findAll(
    filters?: { skip?: number; limit?: number; category?: string; brand?: string; search?: string }
  ): Promise<Device[]> {
    const query: any = {};
    if (filters?.category) {
      if (!Types.ObjectId.isValid(filters.category)) {
        throw new NotFoundException(`Invalid Category ID: ${filters.category}`);
      }
      query.category = new Types.ObjectId(filters.category);
    }
    if (filters?.brand) {
      query.brand = filters.brand;
    }
    if (filters?.search) {
      query.$text = { $search: filters.search };
    }

    let findQuery = this.deviceModel.find(query).populate('category');

    if (filters?.skip) {
      findQuery = findQuery.skip(filters.skip);
    }
    if (filters?.limit) {
      findQuery = findQuery.limit(filters.limit);
    }

    return findQuery.exec();
  }

  async findOne(id: string): Promise<Device> {
    const device = await this.deviceModel.findById(id).populate('category').exec();
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }
    return device;
  }
  
  async findBySlug(slug: string): Promise<Device> {
    const device = await this.deviceModel.findOne({ slug }).populate('category').exec();
    if (!device) {
      throw new NotFoundException(`Device with slug ${slug} not found`);
    }
    return device;
  }

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    const { category, ...deviceData } = createDeviceDto;

    let categoryObjectId: Types.ObjectId | undefined = undefined; // Initialize here
    if (category) {
      if (!Types.ObjectId.isValid(category)) {
        throw new NotFoundException(`Invalid Category ID: ${category}`);
      }
      const categoryDoc = await this.categoryModel.findById(category).exec();
      if (!categoryDoc) {
        throw new NotFoundException(`Category with ID ${category} not found`);
      }
      categoryObjectId = categoryDoc._id;
    }

    const newDevice = new this.deviceModel({
      ...deviceData,
      category: categoryObjectId,
    });
    return newDevice.save();
  }

  async update(id: string, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    const { category, ...deviceData } = updateDeviceDto;

    const updatePayload: Partial<Device> = { ...deviceData };

    if (category) {
      if (!Types.ObjectId.isValid(category)) {
        throw new NotFoundException(`Invalid Category ID: ${category}`);
      }
      const categoryDoc = await this.categoryModel.findById(category).exec();
      if (!categoryDoc) {
        throw new NotFoundException(`Category with ID ${category} not found`);
      }
      updatePayload.category = categoryDoc._id as any;
    } else if (category === null) { // Handle case where category is explicitly set to null
      updatePayload.category = null as any;
    }


    const updatedDevice = await this.deviceModel
      .findByIdAndUpdate(id, updatePayload, { new: true })
      .populate('category')
      .exec();

    if (!updatedDevice) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    return updatedDevice;
  }

  async remove(id: string): Promise<void> {
    const result = await this.deviceModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }
  }

  async getPopularDevices(limit: number): Promise<Device[]> {
    return this.deviceModel.find().sort({ views: -1 }).limit(limit).populate('category').exec();
  }

  async getTrendingDevices(limit: number): Promise<Device[]> {
    return this.deviceModel.find().sort({ createdAt: -1 }).limit(limit).populate('category').exec();
  }

  async getDevicesByCategory(category: string, limit: number): Promise<Device[]> {
    if (!Types.ObjectId.isValid(category)) {
      throw new NotFoundException(`Invalid Category ID: ${category}`);
    }
    return this.deviceModel.find({ category: new Types.ObjectId(category) }).limit(limit).populate('category').exec();
  }

  async getDevicesByBrand(brand: string, limit: number): Promise<Device[]> {
    return this.deviceModel.find({ brand }).limit(limit).populate('category').exec();
  }
}
