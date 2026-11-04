import { Module, forwardRef } from '@nestjs/common';
import { ExternalApiService } from './external-api.service';
import { SyncService } from './sync.service';
import { ExternalApiController } from './external-api.controller';
import { GsmarenaScraperService } from './gsmarena-scraper.service';
import { DevicesModule } from '../devices/devices.module';

import { CategoriesModule } from '../categories/categories.module';
import { BrandsModule } from '../brands/brands.module';

@Module({
  imports: [
    forwardRef(() => DevicesModule), // Circular dependency resolution
    CategoriesModule,
    BrandsModule,
  ],
  controllers: [ExternalApiController],
  providers: [ExternalApiService, GsmarenaScraperService, SyncService],

  exports: [ExternalApiService, GsmarenaScraperService, SyncService],
})
export class ExternalApiModule {}
