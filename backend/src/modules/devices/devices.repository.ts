import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Device, DeviceDocument } from './device.schema';
import { escapeRegExp } from '../../../../shared/src/utils/regex';

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
    sort?: string;
  }): Promise<Device[]> {
    const query: any = {};
    if (filters?.category) {
      query.category = new Types.ObjectId(filters.category);
    }
    if (filters?.brand) {
      query.brand = { $regex: new RegExp(escapeRegExp(filters.brand), 'i') };
    }
    if (filters?.search) {
      // Use text search if available, but fallback to regex for partial matches on model/brand
      const safeSearch = escapeRegExp(filters.search);
      query.$or = [
        { model: { $regex: new RegExp(safeSearch, 'i') } },
        { brand: { $regex: new RegExp(safeSearch, 'i') } },
        { $text: { $search: filters.search } }
      ];
    }

    let findQuery = this.deviceModel.find(query).populate('category').lean();

    // Sorting
    if (filters?.sort) {
      switch (filters.sort) {
        case 'latest':
          findQuery = findQuery.sort({ createdAt: -1 });
          break;
        case 'popular':
          findQuery = findQuery.sort({ views: -1 });
          break;
        case 'price_low':
          findQuery = findQuery.sort({ latestPrice: 1 });
          break;
        case 'price_high':
          findQuery = findQuery.sort({ latestPrice: -1 });
          break;
        case 'alphabetical':
          findQuery = findQuery.sort({ model: 1 });
          break;
        default:
          findQuery = findQuery.sort({ createdAt: -1 });
      }
    } else {
      findQuery = findQuery.sort({ createdAt: -1 });
    }

    if (filters?.skip) {
      findQuery = findQuery.skip(filters.skip);
    }
    if (filters?.limit) {
      findQuery = findQuery.limit(filters.limit);
    }

    return findQuery.exec();
  }

  async countAll(filters?: {
    category?: string;
    brand?: string;
    search?: string;
  }): Promise<number> {
    const query: any = {};
    if (filters?.category) {
      query.category = new Types.ObjectId(filters.category);
    }
    if (filters?.brand) {
      query.brand = { $regex: new RegExp(escapeRegExp(filters.brand), 'i') };
    }
    if (filters?.search) {
      const safeSearch = escapeRegExp(filters.search);
      query.$or = [
        { model: { $regex: new RegExp(safeSearch, 'i') } },
        { brand: { $regex: new RegExp(safeSearch, 'i') } },
        { $text: { $search: filters.search } }
      ];
    }

    return this.deviceModel.countDocuments(query).exec();
  }

  async findOne(id: string): Promise<Device | null> {
    return this.deviceModel.findById(id).populate('category').exec();
  }

  async findBySlug(slug: string): Promise<Device | null> {
    return this.deviceModel.findOne({ slug }).populate('category').lean().exec();
  }

  async update(id: string, updateDeviceData: Partial<Device>): Promise<Device | null> {
    return this.deviceModel.findByIdAndUpdate(id, updateDeviceData, { new: true }).populate('category').exec();
  }

  async remove(id: string): Promise<any> {
    return this.deviceModel.findByIdAndDelete(id).exec();
  }

  async findPopular(limit: number): Promise<Device[]> {
    return this.deviceModel.aggregate([
      {
        $project: {
          _id: 1,
          slug: 1,
          brand: 1,
          model: 1,
          category: 1,
          imageUrl: 1,
          specs: 1,
          views: { $ifNull: ["$views", 0] }, // Ensure views is a number, default to 0 if null/undefined
          isActive: 1,
          description: 1,
          releaseDate: 1,
          dimension: 1,
          os: 1,
          storage: 1,
          displaySize: 1,
          ram: 1,
          battery: 1,
          createdAt: 1,
          updatedAt: 1,
        }
      },
      { $sort: { views: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'categories', // The collection name for categories
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true, // Preserve devices that might not have a category
        },
      },
    ]).exec();
  }

  async findTrending(limit: number): Promise<Device[]> {
    return this.deviceModel.find().sort({ createdAt: -1 }).limit(limit).populate('category').lean().exec();
  }

  async findByCategory(categoryId: string, limit: number): Promise<Device[]> {
    return this.deviceModel.find({ category: new Types.ObjectId(categoryId) }).limit(limit).populate('category').exec();
  }

  async findByBrand(brand: string, limit: number): Promise<Device[]> {
    return this.deviceModel.find({ brand: { $regex: new RegExp(escapeRegExp(brand), 'i') } }).limit(limit).populate('category').exec();
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

    

      async getUniqueBrands(): Promise<string[]> {
    return this.deviceModel.distinct('brand').exec();
  }

  async getUniqueFieldValues(field: string): Promise<string[]> {
    const values = await this.deviceModel.distinct(field).exec();
    return values.filter(v => v !== null && v !== undefined && v !== '') as string[];
  }

  async getTotalViews(): Promise<number> {
    const result = await this.deviceModel.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]).exec();
    return result.length > 0 ? result[0].totalViews : 0;
  }
}

    