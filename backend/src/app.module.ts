import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule'; // Import ScheduleModule
import { mongooseConfig } from './config/mongoose.config';
import { redisConfig } from './config/redis.config';
import { DevicesModule } from './modules/devices/devices.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { PricesModule } from './modules/prices/prices.module';
import { SearchModule } from './modules/search/search.module';
import { ExternalApiModule } from './modules/external-api/external-api.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI') || 'mongodb://localhost:27017/gsmhub',
      }),
      inject: [ConfigService],
    }),
    CacheModule.register(redisConfig),
    ScheduleModule.forRoot(), // Add ScheduleModule here
    DevicesModule,
    CategoriesModule,
    PricesModule,
    SearchModule,
    ExternalApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}