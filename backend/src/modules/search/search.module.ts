import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchIndex, SearchIndexSchema } from './search-index.schema';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { DevicesModule } from '../devices/devices.module'; // Import DevicesModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SearchIndex.name, schema: SearchIndexSchema }]),
    DevicesModule, // Import DevicesModule to provide DeviceModel
  ],
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchService, MongooseModule], // Export SearchService
})
export class SearchModule {}