import {
  Controller,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { CompareService } from './compare.service';

const MAX_COMPARE_DEVICES = 4;

@Controller('compare')
export class CompareController {
  constructor(private readonly compareService: CompareService) {}

  @Get()
  async compare(@Query('devices') devices: string) {
    const slugs = devices.split(',').filter((s) => s.length > 0);
    if (slugs.length < 2) {
      return { message: 'Please provide at least 2 device slugs' };
    }
    if (slugs.length > MAX_COMPARE_DEVICES) {
      throw new BadRequestException(
        `You can compare up to ${MAX_COMPARE_DEVICES} devices at a time`,
      );
    }
    return this.compareService.getDetailedComparison(slugs);
  }
}
