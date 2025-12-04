import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { slugify } from '../../common/utils/slug.util';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const slug = createCategoryDto.slug || slugify(createCategoryDto.name);
    const createdCategory = new this.categoryModel({ ...createCategoryDto, slug });
    return createdCategory.save();
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
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

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    if (updateCategoryDto.name && !updateCategoryDto.slug) {
      updateCategoryDto.slug = slugify(updateCategoryDto.name);
    }
    const existingCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();
    if (!existingCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return existingCategory;
  }

  async remove(id: string): Promise<void> {
    const result = await this.categoryModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }

  async upsertCategory(categoryData: Partial<Category>): Promise<CategoryDocument> {
    if (!categoryData.slug) {
        throw new Error('Category slug is required for upsert operation.');
    }
    const category = await this.categoryModel.findOneAndUpdate(
        { slug: categoryData.slug },
        { $set: categoryData },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return category;
  }
}
