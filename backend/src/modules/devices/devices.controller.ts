import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DeviceResponseDto } from './dto/device-response.dto';

@Controller('devices')
@UseInterceptors(ClassSerializerInterceptor)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  create(@Body() createDeviceDto: CreateDeviceDto): Promise<DeviceResponseDto> {
    return this.devicesService.create(createDeviceDto);
  }

  @Get()
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('category') category?: string,
    @Query('brand') brand?: string,
  ): Promise<DeviceResponseDto[]> {
    return this.devicesService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      category,
      brand,
    });
  }

  @Get('popular')
  getPopularDevices(@Query('limit') limit?: string): Promise<DeviceResponseDto[]> {
    return this.devicesService.getPopularDevices(limit ? parseInt(limit) : 10);
  }

  @Get('trending')
  getTrendingDevices(@Query('limit') limit?: string): Promise<DeviceResponseDto[]> {
    return this.devicesService.getTrendingDevices(limit ? parseInt(limit) : 10);
  }

  @Get('category/:category')
  getDevicesByCategory(
    @Param('category') category: string,
    @Query('limit') limit?: string,
  ): Promise<DeviceResponseDto[]> {
    return this.devicesService.getDevicesByCategory(category, limit ? parseInt(limit) : 50);
  }

  @Get('brand/:brand')
  getDevicesByBrand(
    @Param('brand') brand: string,
    @Query('limit') limit?: string,
  ): Promise<DeviceResponseDto[]> {
    return this.devicesService.getDevicesByBrand(brand, limit ? parseInt(limit) : 50);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string): Promise<DeviceResponseDto> {
    return this.devicesService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<DeviceResponseDto> {
    return this.devicesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ): Promise<DeviceResponseDto> {
    return this.devicesService.update(id, updateDeviceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.devicesService.remove(id);
  }
}
