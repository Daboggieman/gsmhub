import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchIndex, SearchIndexSchema } from './search-index.schema';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: SearchIndex.name, schema: SearchIndexSchema }])],
  providers: [SearchService],
  controllers: [SearchController],
  exports: [MongooseModule],
})
export class SearchModule {}