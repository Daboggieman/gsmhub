import { Controller, Get, Query } from '@nestjs/common';
import { CompareService } from './compare.service';

@Controller('compare')
export class CompareController {
  constructor(private readonly compareService: CompareService) {}

  @Get()
  compare(@Query('devices') devices: string) {
    const [slug1, slug2] = devices.split(',');
    return this.compareService.compareDevices(slug1, slug2);
  }
}
