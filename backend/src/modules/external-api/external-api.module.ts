import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ExternalApiService } from './external-api.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataTransformationService } from './data-transformation.service';
import { SyncService } from './sync.service';
import { DevicesModule } from '../devices/devices.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get<number>('HTTP_TIMEOUT') || 5000,
        maxRedirects: configService.get<number>('HTTP_MAX_REDIRECTS') || 5,
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => DevicesModule), // Circular dependency resolution
    CategoriesModule,
  ],
  providers: [ExternalApiService, DataTransformationService, SyncService],
  exports: [ExternalApiService, DataTransformationService, SyncService],
})
export class ExternalApiModule {}