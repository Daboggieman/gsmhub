import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'; // Import APP_GUARD, APP_INTERCEPTOR

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule'; // Import ScheduleModule
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'; // Import Throttler components


import { mongooseConfig } from './config/mongoose.config';
import * as redisStore from 'cache-manager-redis-store'; // Import redisStore directly
import { DevicesModule } from './modules/devices/devices.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { PricesModule } from './modules/prices/prices.module';
import { SearchModule } from './modules/search/search.module';
import { ExternalApiModule } from './modules/external-api/external-api.module';
import { CompareModule } from './modules/compare/compare.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { AuditLogInterceptor } from './modules/audit-log/audit-log.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');
        if (!uri) {
          throw new Error('MONGO_URI is not defined in environment variables');
        }
        return { uri };
      },
      inject: [ConfigService],
    }),
    CacheModule.register({
      store: redisStore as any,
      url: process.env.REDIS_URI,
      ttl: 3600, // Increase to 1 hour default TTL
      max: 10000, // Increase maximum number of items in cache
      isGlobal: true, // Make CacheModule global
    }),
    ScheduleModule.forRoot(), // Add ScheduleModule here
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),

    DevicesModule,
    CategoriesModule,
    BrandsModule,
    PricesModule,
    SearchModule,
    ExternalApiModule,
    CompareModule,
    AuthModule,
    UsersModule,
    AuditLogModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],

})
export class AppModule { }