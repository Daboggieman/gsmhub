import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { mongooseConfig } from './config/mongoose.config';
import { redisConfig } from './config/redis.config';
import { DevicesModule } from './modules/devices/devices.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { PricesModule } from './modules/prices/prices.module';
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(mongooseConfig.uri),
    CacheModule.register(redisConfig),
    DevicesModule,
    CategoriesModule,
    PricesModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
