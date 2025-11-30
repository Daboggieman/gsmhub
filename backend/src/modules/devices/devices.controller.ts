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
  async create(@Body() createDeviceDto: CreateDeviceDto): Promise<DeviceResponseDto> {
    const device = await this.devicesService.create(createDeviceDto);
    return plainToInstance(DeviceResponseDto, device);
  }

  @Get()
  async findAll(
    @Query('skip') skip?: string,
    @Query('limit') limit?: string, // Changed 'take' to 'limit'
    @Query('category') category?: string,
    @Query('brand') brand?: string,
  ): Promise<DeviceResponseDto[]> {
    const devices = await this.devicesService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      limit: limit ? parseInt(limit) : undefined, // Changed 'take' to 'limit'
      category,
      brand,
    });
    return plainToInstance(DeviceResponseDto, devices);
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

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string): Promise<DeviceResponseDto> {
    const device = await this.devicesService.findBySlug(slug);
    return plainToInstance(DeviceResponseDto, device);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<DeviceResponseDto> {
    const device = await this.devicesService.findOne(id);
    return plainToInstance(DeviceResponseDto, device);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ): Promise<DeviceResponseDto> {
    const device = await this.devicesService.update(id, updateDeviceDto);
    return plainToInstance(DeviceResponseDto, device);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.devicesService.remove(id);
  }
}