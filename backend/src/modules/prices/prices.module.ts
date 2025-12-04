import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PriceHistory, PriceHistorySchema } from './price-history.schema';
import { PricesService } from './prices.service';
import { PricesController } from './prices.controller';
import { DevicesModule } from '../devices/devices.module'; // Import DevicesModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PriceHistory.name, schema: PriceHistorySchema }]),
    forwardRef(() => DevicesModule), // Import DevicesModule to provide DevicesService
  ],
  providers: [PricesService],
  controllers: [PricesController],
  exports: [PricesService, MongooseModule], // Export PricesService
})
export class PricesModule {}