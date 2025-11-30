import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().sort({ name: 'asc' }).exec();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryModel.findOne({ slug }).exec();

    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }

    return category;
  }

  async create(data: Partial<Category>): Promise<Category> {
    const newCategory = new this.categoryModel(data);
    return newCategory.save();
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();

    if (!updatedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return updatedCategory;
  }

  async remove(id: string): Promise<void> {
    const result = await this.categoryModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }
}