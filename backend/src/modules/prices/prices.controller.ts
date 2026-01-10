import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PricesService } from './prices.service';
import { CreatePriceDto, UpdatePriceDto } from './dto/price.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('prices')
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createPriceDto: CreatePriceDto) {
    return this.pricesService.create(createPriceDto);
  }

  @Get()
  findAll() {
    return this.pricesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pricesService.findOne(id);
  }

  @Get('device/:deviceId')
  getCurrentPrices(@Param('deviceId') deviceId: string) {
    return this.pricesService.getCurrentPrices(deviceId);
  }

  @Get('device/:deviceId/history')
  getPriceHistory(@Param('deviceId') deviceId: string) {
    return this.pricesService.getPriceHistory(deviceId);
  }

  @Get('device/:deviceId/trend')
  getPriceTrend(@Param('deviceId') deviceId: string) {
    return this.pricesService.getPriceTrend(deviceId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updatePriceDto: UpdatePriceDto) {
    return this.pricesService.update(id, updatePriceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.pricesService.remove(id);
  }
}
