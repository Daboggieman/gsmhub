import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { Device, DeviceSchema } from './device.schema';
import { Category, CategorySchema } from '../categories/category.schema'; // Import Category schema
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { DeviceApiService } from './device-api.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]), // Add Category MongooseModule
    HttpModule,
  ],
  providers: [DevicesService, DeviceApiService],
  controllers: [DevicesController],
  exports: [DevicesService, MongooseModule],
})
export class DevicesModule {}
