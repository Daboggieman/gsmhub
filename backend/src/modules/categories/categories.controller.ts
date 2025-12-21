import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { DevicesService } from '../devices/devices.service';
import { plainToInstance } from 'class-transformer';

@Controller('categories')
@UseInterceptors(ClassSerializerInterceptor)
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly devicesService: DevicesService,
  ) {}

  @Post()
  // TODO: Implement Admin Guard
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const category = await this.categoriesService.create(createCategoryDto);
    return plainToInstance(CategoryResponseDto, category);
  }

  @Get()
  async findAll() {
    const categories = await this.categoriesService.findAll();
    return plainToInstance(CategoryResponseDto, categories);
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const category = await this.categoriesService.findBySlug(slug);
    return plainToInstance(CategoryResponseDto, category);
  }

  @Get(':slug/devices')
  async findDevicesByCategory(@Param('slug') slug: string) {
    // First, find the category by slug to get its ID
    const category = await this.categoriesService.findBySlug(slug);
    // Then, use the category ID to find devices
    return this.devicesService.getDevicesByCategory(category._id.toString(), 50);
  }

  @Patch(':id')
  // TODO: Implement Admin Guard
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoriesService.update(id, updateCategoryDto);
    return plainToInstance(CategoryResponseDto, category);
  }

  @Delete(':id')
  // TODO: Implement Admin Guard
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}