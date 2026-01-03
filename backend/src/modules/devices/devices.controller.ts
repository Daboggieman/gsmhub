import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, ClassSerializerInterceptor, UseGuards } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DeviceResponseDto } from './dto/device-response.dto';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('devices')
@UseInterceptors(ClassSerializerInterceptor)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createDeviceDto: CreateDeviceDto): Promise<DeviceResponseDto> {
    const device = await this.devicesService.create(createDeviceDto);
    return plainToInstance(DeviceResponseDto, device);
  }

  @Get()
  async getAllDevices(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('category') category?: string,
    @Query('brand') brand?: string,
    @Query('search') search?: string, // Changed from 'q' to 'search' to match repo/service, verify frontend usage!
    @Query('sort') sort?: string,
    @Query('minRam') minRam?: number,
    @Query('maxRam') maxRam?: number,
    @Query('minStorage') minStorage?: number,
    @Query('maxStorage') maxStorage?: number,
    @Query('minBattery') minBattery?: number,
    @Query('maxBattery') maxBattery?: number,
    @Query('minDisplay') minDisplay?: number,
    @Query('maxDisplay') maxDisplay?: number,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
  ) {
    limit = limit > 50 ? 50 : limit;

    const parseNum = (val: any) => val ? Number(val) : undefined;

    const { devices, total } = await this.devicesService.getAllDevices({
      skip: (page - 1) * limit,
      limit,
      category,
      brand,
      search,
      sort,
      minRam: parseNum(minRam),
      maxRam: parseNum(maxRam),
      minStorage: parseNum(minStorage),
      maxStorage: parseNum(maxStorage),
      minBattery: parseNum(minBattery),
      maxBattery: parseNum(maxBattery),
      minDisplay: parseNum(minDisplay),
      maxDisplay: parseNum(maxDisplay),
      minPrice: parseNum(minPrice),
      maxPrice: parseNum(maxPrice),
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

  @Get('suggestions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getFieldSuggestions(): Promise<Record<string, string[]>> {
    return this.devicesService.getFieldSuggestions();
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ): Promise<DeviceResponseDto> {
    const device = await this.devicesService.update(id, updateDeviceDto);
    return plainToInstance(DeviceResponseDto, device);
  }

  @Post('sync')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async syncFromApi(@Body() body: { brand: string; model: string }): Promise<DeviceResponseDto> {
    const device = await this.devicesService.syncDeviceFromAPI(body.brand, body.model);
    return plainToInstance(DeviceResponseDto, device);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string): Promise<void> {
    return this.devicesService.remove(id);
  }
}