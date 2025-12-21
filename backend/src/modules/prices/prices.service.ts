import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PriceHistory, PriceHistoryDocument } from './price-history.schema';
import { CreatePriceDto, UpdatePriceDto } from './dto/price.dto';
import { DevicesService } from '../devices/devices.service';

@Injectable()
export class PricesService {
  constructor(
    @InjectModel(PriceHistory.name) private priceHistoryModel: Model<PriceHistoryDocument>,
    @Inject(forwardRef(() => DevicesService))
    private readonly devicesService: DevicesService,
  ) {}

  async create(createPriceDto: CreatePriceDto): Promise<PriceHistory> {
    await this.devicesService.findOne(createPriceDto.device);
    const createdPrice = new this.priceHistoryModel({
      ...createPriceDto,
      date: createPriceDto.date || new Date().toISOString()
    });
    return createdPrice.save();
  }

  async findAll(): Promise<PriceHistory[]> {
    return this.priceHistoryModel.find().populate('device').exec();
  }

  async findOne(id: string): Promise<PriceHistory> {
    const price = await this.priceHistoryModel.findById(id).populate('device').exec();
    if (!price) {
      throw new NotFoundException(`Price with ID ${id} not found`);
    }
    return price;
  }

  async findByDevice(deviceId: string): Promise<PriceHistory[]> {
    return this.priceHistoryModel.find({ device: deviceId }).sort({ date: -1 }).exec();
  }

  async getCurrentPrices(deviceId: string): Promise<PriceHistory[]> {
    // Get the latest price for each unique country/retailer combination
    return this.priceHistoryModel.aggregate([
      { $match: { device: deviceId } },
      { $sort: { date: -1 } },
      { 
        $group: { 
          _id: { country: "$country", retailer: "$retailer" },
          latestPrice: { $first: "$$ROOT" }
        }
      },
      { $replaceRoot: { newRoot: "$latestPrice" } }
    ]).exec();
  }

  async getPriceHistory(deviceId: string): Promise<PriceHistory[]> {
    return this.priceHistoryModel.find({ device: deviceId }).sort({ date: 1 }).exec();
  }

  async findLatestPriceByDeviceId(deviceId: string): Promise<PriceHistory | null> {
    return this.priceHistoryModel.findOne({ device: deviceId }).sort({ date: -1 }).exec();
  }

  async getPriceTrend(deviceId: string): Promise<{ trend: 'up' | 'down' | 'stable'; percentage: number }> {
    const history = await this.priceHistoryModel
      .find({ device: deviceId })
      .sort({ date: -1 })
      .limit(2)
      .exec();

    if (history.length < 2) {
      return { trend: 'stable', percentage: 0 };
    }

    const current = history[0].price;
    const previous = history[1].price;

    if (current === previous) return { trend: 'stable', percentage: 0 };

    const percentage = ((current - previous) / previous) * 100;
    return {
      trend: current > previous ? 'up' : 'down',
      percentage: Math.abs(percentage)
    };
  }

  async update(id: string, updatePriceDto: UpdatePriceDto): Promise<PriceHistory> {
    const existingPrice = await this.priceHistoryModel
      .findByIdAndUpdate(id, updatePriceDto, { new: true })
      .exec();
    if (!existingPrice) {
      throw new NotFoundException(`Price with ID ${id} not found`);
    }
    return existingPrice;
  }

  async remove(id: string): Promise<void> {
    const result = await this.priceHistoryModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Price with ID ${id} not found`);
    }
  }
}
