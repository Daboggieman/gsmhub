import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand, BrandDocument } from './brand.schema';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
import { generateSlug } from '../../common/utils/slug.util';
import { Device, DeviceDocument } from '../devices/device.schema';

@Injectable()
export class BrandsService {
  constructor(
    @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    const slug = createBrandDto.slug || generateSlug(createBrandDto.name);
    
    const existing = await this.brandModel.findOne({ slug }).exec();
    if (existing) {
      throw new ConflictException('Brand with this slug already exists');
    }

    const newBrand = new this.brandModel({
      ...createBrandDto,
      slug,
    });

    return newBrand.save();
  }

  async findAll(search?: string): Promise<Brand[]> {
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, 'i') } },
        { slug: { $regex: new RegExp(search, 'i') } },
      ];
    }
    const brands = await this.brandModel.find(query).sort({ name: 1 }).exec();
    
    // Dynamically update device counts
    return Promise.all(brands.map(async (brand) => {
      const count = await this.deviceModel.countDocuments({ brand: brand.name }).exec();
      brand.deviceCount = count;
      return brand;
    }));
  }

  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandModel.findById(id).exec();
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async findBySlug(slug: string): Promise<Brand> {
    const brand = await this.brandModel.findOne({ slug }).exec();
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    if (updateBrandDto.name && !updateBrandDto.slug) {
      updateBrandDto.slug = generateSlug(updateBrandDto.name);
    }

    const updated = await this.brandModel.findByIdAndUpdate(
      id,
      { $set: updateBrandDto },
      { new: true }
    ).exec();

    if (!updated) throw new NotFoundException('Brand not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.brandModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Brand not found');
  }

  async count(): Promise<number> {
    return this.brandModel.countDocuments().exec();
  }
}
