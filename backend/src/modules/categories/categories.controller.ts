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
import { DevicesService } from '../devices/devices.service';

@Controller('categories')
@UseInterceptors(ClassSerializerInterceptor)
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly devicesService: DevicesService,
  ) {}

  @Post()
  // TODO: Implement Admin Guard
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Get(':slug/devices')
  findDevicesByCategory(@Param('slug') slug: string) {
    // First, find the category by slug to get its ID
    return this.categoriesService.findBySlug(slug).then(category => {
      // Then, use the category ID to find devices
      return this.devicesService.getDevicesByCategory(category._id.toString(), 50);
    });
  }

  @Patch(':id')
  // TODO: Implement Admin Guard
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  // TODO: Implement Admin Guard
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}