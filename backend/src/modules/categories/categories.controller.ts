import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { DevicesService } from '../devices/devices.service';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('categories')
@UseInterceptors(ClassSerializerInterceptor)
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly devicesService: DevicesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const category = await this.categoriesService.create(createCategoryDto);
    return plainToInstance(CategoryResponseDto, category);
  }

  @Get()
  async findAll(@Query('search') search?: string) {
    const categories = await this.categoriesService.findAll(search);
    console.log(`Found ${categories.length} categories`);
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoriesService.update(id, updateCategoryDto);
    return plainToInstance(CategoryResponseDto, category);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    console.log(`Attempting to delete category with ID: ${id}`);
    return this.categoriesService.remove(id);
  }
}