import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from './device.schema';
import { DevicesController } from './devices.controller';
import { DeviceApiService } from './device-api.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }])],
  providers: [DeviceApiService],
  controllers: [DevicesController],
  exports: [MongooseModule],
})
export class DevicesModule {}