import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DeviceResponseDto } from './dto/device-response.dto';
import { plainToInstance } from 'class-transformer';

@Controller('devices')
@UseInterceptors(ClassSerializerInterceptor)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  // TODO: Implement Admin Guard for authentication and authorization
  async create(@Body() createDeviceDto: CreateDeviceDto): Promise<DeviceResponseDto> {
    const device = await this.devicesService.create(createDeviceDto);
    return plainToInstance(DeviceResponseDto, device);
  }

  @Get()
  async getAllDevices(
    @Query('skip') skip?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('brand') brand?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
  ): Promise<{ devices: DeviceResponseDto[]; total: number }> {
    const { devices, total } = await this.devicesService.getAllDevices({
      skip: skip ? parseInt(skip) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      category,
      brand,
      search,
      sort,
    });
    return {
      devices: plainToInstance(DeviceResponseDto, devices),
      total,
    };
  }

  @Get('popular')
  async getPopularDevices(@Query('limit') limit?: string): Promise<DeviceResponseDto[]> {
    const devices = await this.devicesService.getPopularDevices(limit ? parseInt(limit) : 10);
    return plainToInstance(DeviceResponseDto, devices);
  }

  @Get('trending')
  async getTrendingDevices(@Query('limit') limit?: string): Promise<DeviceResponseDto[]> {
    const devices = await this.devicesService.getTrendingDevices(limit ? parseInt(limit) : 10);
    return plainToInstance(DeviceResponseDto, devices);
  }

  @Get('brands')
  async getBrands(): Promise<string[]> {
    return this.devicesService.getBrands();
  }

  @Get('category/:category')
  async getDevicesByCategory(
    @Param('category') category: string,
    @Query('limit') limit?: string,
  ): Promise<DeviceResponseDto[]> {
    const devices = await this.devicesService.getDevicesByCategory(category, limit ? parseInt(limit) : 50);
    return plainToInstance(DeviceResponseDto, devices);
  }

  @Get('brand/:brand')
  async getDevicesByBrand(
    @Param('brand') brand: string,
    @Query('limit') limit?: string,
  ): Promise<DeviceResponseDto[]> {
    const devices = await this.devicesService.getDevicesByBrand(brand, limit ? parseInt(limit) : 50);
    return plainToInstance(DeviceResponseDto, devices);
  }

  // Ensure this route is defined before the /:id route to avoid conflicts
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<DeviceResponseDto> {
    // Increment view count when a device is fetched by its slug
    await this.devicesService.increaseViewCount(slug);
    const device = await this.devicesService.findBySlug(slug);
    return plainToInstance(DeviceResponseDto, device);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<DeviceResponseDto> {
    const device = await this.devicesService.findOne(id);
    return plainToInstance(DeviceResponseDto, device);
  }

  @Patch(':id')
  // TODO: Implement Admin Guard for authentication and authorization
  async update(
    @Param('id') id: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ): Promise<DeviceResponseDto> {
    const device = await this.devicesService.update(id, updateDeviceDto);
    return plainToInstance(DeviceResponseDto, device);
  }

  @Delete(':id')
  // TODO: Implement Admin Guard for authentication and authorization
  remove(@Param('id') id: string): Promise<void> {
    return this.devicesService.remove(id);
  }
}