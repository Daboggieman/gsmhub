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
  UseGuards,
} from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
import { BrandResponseDto } from './dto/brand-response.dto';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('brands')
@UseInterceptors(ClassSerializerInterceptor)
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createBrandDto: CreateBrandDto) {
    const brand = await this.brandsService.create(createBrandDto);
    return plainToInstance(BrandResponseDto, brand);
  }

  @Get()
  async findAll() {
    const brands = await this.brandsService.findAll();
    return plainToInstance(BrandResponseDto, brands);
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const brand = await this.brandsService.findBySlug(slug);
    return plainToInstance(BrandResponseDto, brand);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    const brand = await this.brandsService.update(id, updateBrandDto);
    return plainToInstance(BrandResponseDto, brand);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }
}
