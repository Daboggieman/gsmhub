import { Controller, Get, Query } from '@nestjs/common';
import { CompareService } from './compare.service';

@Controller('compare')
export class CompareController {
  constructor(private readonly compareService: CompareService) {}

  @Get()
  async compare(@Query('devices') devices: string) {
    const slugs = devices.split(',').filter(s => s.length > 0);
    if (slugs.length < 2) {
      return { message: 'Please provide at least 2 device slugs' };
    }
    return this.compareService.getDetailedComparison(slugs);
  }
}
