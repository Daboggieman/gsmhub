import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ExternalApiService } from './external-api.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataTransformationService } from './data-transformation.service';
import { SyncService } from './sync.service'; // Import SyncService
import { DevicesModule } from '../devices/devices.module'; // Import DevicesModule
import { CategoriesModule } from '../categories/categories.module'; // Import CategoriesModule

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get<number>('HTTP_TIMEOUT') || 5000,
        maxRedirects: configService.get<number>('HTTP_MAX_REDIRECTS') || 5,
        headers: {
          // Potentially add headers like API key here if it's global for all external API calls
          // 'X-API-KEY': configService.get<string>('EXTERNAL_API_KEY'),
        },
      }),
      inject: [ConfigService],
    }),
    DevicesModule, // Import DevicesModule
    CategoriesModule, // Import CategoriesModule
  ],
  providers: [ExternalApiService, DataTransformationService, SyncService], // Add SyncService here
  exports: [ExternalApiService, DataTransformationService, SyncService], // Export SyncService if needed
})
export class ExternalApiModule {}