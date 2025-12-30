import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { generateSlug } from '../../common/utils/slug.util';
import { escapeRegExp } from '../../../../shared/src/utils/regex';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const slug = createCategoryDto.slug || generateSlug(createCategoryDto.name);
    
    // Check for existing name or slug
    const existing = await this.categoryModel.findOne({
      $or: [{ name: createCategoryDto.name }, { slug }],
    });

    if (existing) {
      throw new ConflictException('Category with this name or slug already exists');
    }

    const createdCategory = new this.categoryModel({ ...createCategoryDto, slug });
    return createdCategory.save();
  }

  async findAll(search?: string): Promise<Category[]> {
    const query: any = {};
    if (search) {
      const safeSearch = escapeRegExp(search);
      query.$or = [
        { name: { $regex: new RegExp(safeSearch, 'i') } },
        { slug: { $regex: new RegExp(safeSearch, 'i') } },
      ];
    }
    return this.categoryModel.find(query).sort({ name: 1 }).exec();
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
      updateCategoryDto.slug = generateSlug(updateCategoryDto.name);
    }

    // Check for conflicts with other categories
    if (updateCategoryDto.name || updateCategoryDto.slug) {
      const conflict = await this.categoryModel.findOne({
        _id: { $ne: id },
        $or: [
          ...(updateCategoryDto.name ? [{ name: updateCategoryDto.name }] : []),
          ...(updateCategoryDto.slug ? [{ slug: updateCategoryDto.slug }] : []),
        ],
      });

      if (conflict) {
        throw new ConflictException('Another category with this name or slug already exists');
      }
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
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) {
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

  async count(): Promise<number> {
    return this.categoryModel.countDocuments().exec();
  }
}
