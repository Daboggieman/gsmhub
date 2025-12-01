import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Device, DeviceDocument } from './device.schema';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}

  async create(createDeviceData: Partial<Device>): Promise<Device> {
    const newDevice = new this.deviceModel(createDeviceData);
    return newDevice.save();
  }

  async findAll(filters?: {
    skip?: number;
    limit?: number;
    category?: string;
    brand?: string;
    search?: string;
  }): Promise<Device[]> {
    const query: any = {};
    if (filters?.category) {
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

  async findOne(id: string): Promise<Device | null> {
    return this.deviceModel.findById(id).populate('category').exec();
  }

  async findBySlug(slug: string): Promise<Device | null> {
    return this.deviceModel.findOne({ slug }).populate('category').exec();
  }

  async update(id: string, updateDeviceData: Partial<Device>): Promise<Device | null> {
    return this.deviceModel.findByIdAndUpdate(id, updateDeviceData, { new: true }).populate('category').exec();
  }

  async remove(id: string): Promise<{ deletedCount?: number }> {
    return this.deviceModel.deleteOne({ _id: id }).exec();
  }

  async findPopular(limit: number): Promise<Device[]> {
    return this.deviceModel.find().sort({ views: -1 }).limit(limit).populate('category').exec();
  }

  async findTrending(limit: number): Promise<Device[]> {
    return this.deviceModel.find().sort({ createdAt: -1 }).limit(limit).populate('category').exec();
  }

  async findByCategory(categoryId: string, limit: number): Promise<Device[]> {
    return this.deviceModel.find({ category: new Types.ObjectId(categoryId) }).limit(limit).populate('category').exec();
  }

  async findByBrand(brand: string, limit: number): Promise<Device[]> {
    return this.deviceModel.find({ brand }).limit(limit).populate('category').exec();
  }

  async incrementViewCount(slug: string): Promise<Device | null> {
    const device = await this.deviceModel.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('category').exec();
    return device;
  }

  async upsert(deviceData: Partial<Device>): Promise<Device | null> {
    if (!deviceData.slug) {
      throw new Error('Device slug is required for upsert operation.');
    }

    const updatedDevice = await this.deviceModel.findOneAndUpdate(
      { slug: deviceData.slug },
      { $set: deviceData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('category').exec();

    return updatedDevice;
  }
}
