import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { Device, DeviceSchema } from './device.schema';
import { Category, CategorySchema } from '../categories/category.schema';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { DevicesRepository } from './devices.repository';
import { CategoriesModule } from '../categories/categories.module';
import { PricesModule } from '../prices/prices.module';
import { ExternalApiModule } from '../external-api/external-api.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
    HttpModule,
    forwardRef(() => ExternalApiModule), // Circular dependency resolution
    forwardRef(() => CategoriesModule),
    forwardRef(() => PricesModule),
  ],
  providers: [DevicesService, DevicesRepository],
  controllers: [DevicesController],
  exports: [DevicesService, DevicesRepository, MongooseModule],
})
export class DevicesModule {}