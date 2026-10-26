import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { PipelineStage } from 'mongoose';
import { Device, DeviceDocument } from './device.schema';
import { escapeRegExp } from '@shared/utils/regex';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}

  /**
   * `$lookup` + `$addFields` stages resolving `latestPrice` from the
   * pricehistories collection — the Device doc never stores it. The
   * `$lookup` only fetches price and date fields to keep the join cheap.
   */
  private get latestPriceStages(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: 'pricehistories',
          let: { deviceId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$device', '$$deviceId'] } } },
            { $sort: { date: -1 } },
            { $limit: 1 },
            { $project: { _id: 0, price: 1, date: 1 } },
          ],
          as: '__latestPrice',
        },
      },
      {
        $addFields: {
          latestPrice: {
            $ifNull: [{ $arrayElemAt: ['$__latestPrice.price', 0] }, null],
          },
        },
      },
      { $project: { __latestPrice: 0 } },
    ] as PipelineStage[];
  }

  async create(createDeviceData: Partial<Device>): Promise<Device> {
    const newDevice = new this.deviceModel(createDeviceData);
    const saved = await newDevice.save();
    return saved.toObject();
  }

  async findAll(filters?: {
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
  }): Promise<Device[]> {
    const query: any = {};
    if (filters?.category) {
      query.category = new Types.ObjectId(filters.category);
    }
    if (filters?.brand) {
      query.brand = { $regex: new RegExp(escapeRegExp(filters.brand), 'i') };
    }
    if (filters?.search) {
      // Use regex for partial matches on name, model, and brand
      // We removed $text search to avoid "text index not found" errors and incompatibility with $or
      const safeSearch = escapeRegExp(filters.search);
      query.$or = [
        { name: { $regex: new RegExp(safeSearch, 'i') } },
        { model: { $regex: new RegExp(safeSearch, 'i') } },
        { brand: { $regex: new RegExp(safeSearch, 'i') } },
      ];
    }

    // Range Filters
    if (filters?.minRam || filters?.maxRam) {
      query.ramValue = {};
      if (filters.minRam) query.ramValue.$gte = filters.minRam;
      if (filters.maxRam) query.ramValue.$lte = filters.maxRam;
    }

    if (filters?.minStorage || filters?.maxStorage) {
      query.storageValue = {};
      if (filters.minStorage) query.storageValue.$gte = filters.minStorage;
      if (filters.maxStorage) query.storageValue.$lte = filters.maxStorage;
    }

    if (filters?.minBattery || filters?.maxBattery) {
      query.batteryValue = {};
      if (filters.minBattery) query.batteryValue.$gte = filters.minBattery;
      if (filters.maxBattery) query.batteryValue.$lte = filters.maxBattery;
    }

    if (filters?.minDisplay || filters?.maxDisplay) {
      query.displaySizeValue = {};
      if (filters.minDisplay) query.displaySizeValue.$gte = filters.minDisplay;
      if (filters.maxDisplay) query.displaySizeValue.$lte = filters.maxDisplay;
    }

    const hasPriceFilter = filters?.minPrice || filters?.maxPrice;
    const priceSort =
      filters?.sort === 'price_low' || filters?.sort === 'price_high';

    // Price filtering/sorting must run against the latest known price, which
    // lives in the pricehistory collection — the Device doc never stores it.
    // Use a $lookup-backed pipeline for these cases so they work correctly.
    if (hasPriceFilter || priceSort) {
      const match: any = { ...query };
      if (filters?.minPrice || filters?.maxPrice) {
        match.latestPrice = {};
        if (filters.minPrice) match.latestPrice.$gte = filters.minPrice;
        if (filters.maxPrice) match.latestPrice.$lte = filters.maxPrice;
      }
      // Sorting by price only makes sense for devices that have one —
      // exclude unpriced devices instead of letting nulls sort first.
      if (priceSort) match.latestPrice = { ...(match.latestPrice || {}), $ne: null };
      const pipeline: any[] = [
        { $match: query },
        ...this.latestPriceStages,
        { $match: match },
      ];
      if (filters?.sort === 'price_low') {
        pipeline.push({ $sort: { latestPrice: 1 } });
      } else if (filters?.sort === 'price_high') {
        pipeline.push({ $sort: { latestPrice: -1 } });
      } else if (filters?.sort) {
        switch (filters.sort) {
          case 'latest': pipeline.push({ $sort: { createdAt: -1 } }); break;
          case 'popular': pipeline.push({ $sort: { views: -1 } }); break;
          case 'alphabetical': pipeline.push({ $sort: { model: 1 } }); break;
          default: pipeline.push({ $sort: { createdAt: -1 } });
        }
      } else {
        pipeline.push({ $sort: { createdAt: -1 } });
      }
      if (filters?.skip) pipeline.push({ $skip: filters.skip });
      if (filters?.limit) pipeline.push({ $limit: filters.limit });
      // Populate category like the find path does.
      pipeline.push({
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      });
      pipeline.push({ $unwind: { path: '$category', preserveNullAndEmptyArrays: true } });
      return this.deviceModel.aggregate(pipeline).exec();
    }

    // All other paths: use aggregate so latestPriceStages is always applied.
    let sortStage: any;
    if (filters?.sort) {
      switch (filters.sort) {
        case 'latest':    sortStage = { createdAt: -1 }; break;
        case 'popular':   sortStage = { views: -1 }; break;
        case 'alphabetical': sortStage = { model: 1 }; break;
        default:          sortStage = { createdAt: -1 };
      }
    } else {
      sortStage = { createdAt: -1 };
    }

    const pipeline: any[] = [
      { $match: query },
      ...this.latestPriceStages,
      { $sort: sortStage },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    ];
    if (filters?.skip) pipeline.push({ $skip: filters.skip });
    if (filters?.limit) pipeline.push({ $limit: filters.limit });

    return this.deviceModel.aggregate(pipeline).exec();
  }

  async countAll(filters?: {
    category?: string;
    brand?: string;
    search?: string;
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
  }): Promise<number> {
    const query: any = {};
    const parse = (v: any) => {
      if (v === undefined || v === null || v === '') return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };

    if (filters?.category) query.category = new Types.ObjectId(filters.category);
    if (filters?.brand) {
      query.brand = { $regex: new RegExp(escapeRegExp(filters.brand), 'i') };
    }
    if (filters?.search) {
      const safeSearch = escapeRegExp(filters.search);
      query.$or = [
        { name: { $regex: new RegExp(safeSearch, 'i') } },
        { model: { $regex: new RegExp(safeSearch, 'i') } },
        { brand: { $regex: new RegExp(safeSearch, 'i') } },
      ];
    }
    const ranges: [string, any, any][] = [
      ['ramValue', parse(filters?.minRam), parse(filters?.maxRam)],
      ['storageValue', parse(filters?.minStorage), parse(filters?.maxStorage)],
      ['batteryValue', parse(filters?.minBattery), parse(filters?.maxBattery)],
      ['displaySizeValue', parse(filters?.minDisplay), parse(filters?.maxDisplay)],
    ];
    for (const [field, low, high] of ranges) {
      if (low !== undefined || high !== undefined) {
        query[field] = {};
        if (low !== undefined) query[field].$gte = low;
        if (high !== undefined) query[field].$lte = high;
      }
    }
    const minPrice = parse(filters?.minPrice);
    const maxPrice = parse(filters?.maxPrice);

    if (minPrice !== undefined || maxPrice !== undefined) {
      // price range operates on the pricehistory $lookup, matching findAll
      const pipeline: any[] = [];
      if (Object.keys(query).length) pipeline.push({ $match: query });
      pipeline.push(
        ...this.latestPriceStages,
        {
          $match: {
            latestPrice: {
              ...(minPrice !== undefined ? { $gte: minPrice } : {}),
              ...(maxPrice !== undefined ? { $lte: maxPrice } : {}),
            },
          },
        },
        { $count: 'n' },
      );
      const res = await this.deviceModel.aggregate(pipeline).exec();
      return res.length ? res[0].n : 0;
    }

    return this.deviceModel.countDocuments(query).exec();
  }

  async findOne(id: string): Promise<Device | null> {
    return this.deviceModel.findById(id).populate('category').lean().exec();
  }

  async findBySlug(slug: string): Promise<Device | null> {
    const results = await this.deviceModel
      .aggregate([{ $match: { slug } }, ...this.latestPriceStages])
      .exec();
    if (!results.length) return null;
    const doc = results[0];
    return this.deviceModel.populate(doc, { path: 'category' }) as unknown as Device;
  }

  async update(
    id: string,
    updateDeviceData: Partial<Device>,
  ): Promise<Device | null> {
    return this.deviceModel
      .findByIdAndUpdate(id, updateDeviceData, { new: true })
      .populate('category')
      .lean()
      .exec();
  }

  async remove(id: string): Promise<any> {
    return this.deviceModel.findByIdAndDelete(id).exec();
  }

  async findPopular(limit: number): Promise<Device[]> {
    return this.deviceModel
      .aggregate([
        {
          $project: {
            _id: 1,
            slug: 1,
            brand: 1,
            model: 1,
            category: 1,
            imageUrl: 1,
            specs: 1,
            views: { $ifNull: ['$views', 0] }, // Ensure views is a number, default to 0 if null/undefined
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
          },
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
        ...this.latestPriceStages,
      ])
      .exec();
  }

  async findTrending(limit: number): Promise<Device[]> {
    return this.deviceModel
      .aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category',
          },
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true,
          },
        },
        ...this.latestPriceStages,
      ])
      .exec();
  }

  async findByCategory(categoryId: string, limit: number): Promise<Device[]> {
    return this.deviceModel
      .aggregate([
        { $match: { category: new Types.ObjectId(categoryId) } },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category',
          },
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true,
          },
        },
        ...this.latestPriceStages,
      ])
      .exec();
  }

  async findByBrand(brand: string, limit: number): Promise<Device[]> {
    return this.deviceModel
      .aggregate([
        { $match: { brand: { $regex: new RegExp(escapeRegExp(brand), 'i') } } },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category',
          },
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true,
          },
        },
        ...this.latestPriceStages,
      ])
      .exec();
  }

  async incrementViewCount(slug: string): Promise<Device | null> {
    const device = await this.deviceModel
      .findOneAndUpdate({ slug }, { $inc: { views: 1 } }, { new: true })
      .populate('category')
      .lean()
      .exec();
    return device as Device;
  }

  async upsert(deviceData: Partial<Device>): Promise<Device | null> {
    if (!deviceData.slug) {
      throw new Error('Device slug is required for upsert operation.');
    }

    const updatedDevice = await this.deviceModel
      .findOneAndUpdate(
        { slug: deviceData.slug },
        { $set: deviceData },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .populate('category')
      .lean()
      .exec();

    return updatedDevice;
  }

  async getUniqueBrands(): Promise<string[]> {
    return this.deviceModel.distinct('brand').exec();
  }

  async getUniqueFieldValues(field: string): Promise<string[]> {
    const values = await this.deviceModel.distinct(field).exec();
    return values.filter(
      (v) => v !== null && v !== undefined && v !== '',
    ) as string[];
  }

  async getTotalViews(): Promise<number> {
    const result = await this.deviceModel
      .aggregate([{ $group: { _id: null, totalViews: { $sum: '$views' } } }])
      .exec();
    return result.length > 0 ? result[0].totalViews : 0;
  }
}
