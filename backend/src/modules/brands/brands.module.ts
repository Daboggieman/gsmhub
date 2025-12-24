import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';
import { Brand, BrandSchema } from './brand.schema';
import { Device, DeviceSchema } from '../devices/device.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Brand.name, schema: BrandSchema },
      { name: Device.name, schema: DeviceSchema }
    ]),
  ],
  controllers: [BrandsController],
  providers: [BrandsService],
  exports: [BrandsService],
})
export class BrandsModule {}
