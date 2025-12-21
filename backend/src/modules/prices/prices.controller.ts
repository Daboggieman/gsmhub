import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PricesService } from './prices.service';
import { CreatePriceDto, UpdatePriceDto } from './dto/price.dto';

@Controller('prices')
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  @Post()
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
  update(@Param('id') id: string, @Body() updatePriceDto: UpdatePriceDto) {
    return this.pricesService.update(id, updatePriceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pricesService.remove(id);
  }
}
