import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './category.schema';

@Injectable()
export class CategoriesSeeder {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async seed() {
    const predefinedCategories = [
      { name: 'Smartphones', slug: 'smartphones' },
      { name: 'Tablets', slug: 'tablets' },
      { name: 'Laptops', slug: 'laptops' },
      { name: 'Smartwatches', slug: 'smartwatches' },
      { name: 'Gaming Laptops', slug: 'gaming-laptops' },
      { name: 'Budget Phones', slug: 'budget-phones' },
    ];

    for (const category of predefinedCategories) {
      const exists = await this.categoryModel.findOne({ slug: category.slug }).exec();
      if (!exists) {
        await new this.categoryModel(category).save();
      }
    }
  }
}
