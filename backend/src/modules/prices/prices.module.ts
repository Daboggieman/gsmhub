import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PriceHistory, PriceHistorySchema } from './price-history.schema';
import { PricesService } from './prices.service';
import { PricesController } from './prices.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: PriceHistory.name, schema: PriceHistorySchema }])],
  providers: [PricesService],
  controllers: [PricesController],
  exports: [MongooseModule],
})
export class PricesModule {}