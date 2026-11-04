import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { parsePositiveInt } from '../../common/utils/parse-positive-int.util';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.searchService.search(query, parsePositiveInt(limit, 10, 50));
  }

  @Get('autocomplete')
  autocomplete(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.searchService.getAutocomplete(
      query,
      parsePositiveInt(limit, 5, 20),
    );
  }

  @Get('suggestions')
  suggestions(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.searchService.getSuggestions(
      query,
      parsePositiveInt(limit, 5, 20),
    );
  }
}
