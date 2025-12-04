import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PriceHistory, PriceHistoryDocument } from './price-history.schema';
import { CreatePriceDto, UpdatePriceDto } from './dto/price.dto';
import { DevicesService } from '../devices/devices.service';

@Injectable()
export class PricesService {
  constructor(
    @InjectModel(PriceHistory.name) private priceHistoryModel: Model<PriceHistoryDocument>,
    private readonly devicesService: DevicesService,
  ) {}

  async create(createPriceDto: CreatePriceDto): Promise<PriceHistory> {
    // Ensure the device exists before creating a price for it
    await this.devicesService.findOne(createPriceDto.device);
    const createdPrice = new this.priceHistoryModel(createPriceDto);
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
    return this.priceHistoryModel.find({ device: deviceId }).populate('device').exec();
  }

  async getPriceHistory(deviceId: string): Promise<PriceHistory[]> {
    return this.priceHistoryModel.find({ device: deviceId }).sort({ date: -1 }).populate('device').exec();
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