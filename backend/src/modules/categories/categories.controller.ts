import { Controller, Get, Param, Post, Body, Patch, Delete } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './category.schema';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  @Post()
  create(@Body() createCategoryDto: Partial<Category>): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: Partial<Category>): Promise<Category> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
