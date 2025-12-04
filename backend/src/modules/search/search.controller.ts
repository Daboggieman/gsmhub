import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.searchService.search(query, limit ? parseInt(limit) : 10);
  }

  @Get('autocomplete')
  autocomplete(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.searchService.getAutocomplete(query, limit ? parseInt(limit) : 5);
  }

  @Get('suggestions')
  suggestions(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.searchService.getSuggestions(query, limit ? parseInt(limit) : 5);
  }
}