import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device, DeviceDocument } from '../devices/device.schema';
import { SearchIndex, SearchIndexDocument } from './search-index.schema';
import { SearchQuery, SearchQueryDocument } from './search-query.schema';
import { SearchResult } from '@shared/types';
import { escapeRegExp } from '../../../../shared/src/utils/regex';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    @InjectModel(SearchIndex.name) private searchIndexModel: Model<SearchIndexDocument>,
    @InjectModel(SearchQuery.name) private searchQueryModel: Model<SearchQueryDocument>,
  ) {}

  async search(query: string, limit: number = 10): Promise<SearchResult[]> {
    if (!query) return [];
    
    // Log the search query for analytics
    this.logSearchQuery(query);

    const safeSearch = escapeRegExp(query.trim());
    const searchRegex = new RegExp(safeSearch, 'i');

    // Use a combination of text search and regex for better fuzzy-like matching
    const devices = await this.deviceModel
      .find({
        $or: [
          { $text: { $search: query } },
          { name: searchRegex },
          { brand: searchRegex },
          { model: searchRegex }
        ],
        isActive: true
      }, {
        score: { $meta: 'textScore' }
      })
      .sort({ 
        score: { $meta: 'textScore' },
        views: -1 // Use views as tie-breaker for popularity
      })
      .limit(limit)
      .exec();
    
    return this.mapToSearchResults(devices);
  }

  async getAutocomplete(query: string, limit: number = 8): Promise<SearchResult[]> {
    if (!query || query.length < 2) {
      return [];
    }
    
    const searchRegex = new RegExp(escapeRegExp(query), 'i');
    
    const devices = await this.deviceModel
      .find({
        $or: [
          { name: searchRegex },
          { brand: searchRegex },
          { model: searchRegex },
        ],
        isActive: true
      })
      .sort({ views: -1 })
      .limit(limit)
      .exec();
    
    return this.mapToSearchResults(devices);
  }

  async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    // Return popular queries starting with the given string
    const suggestions = await this.searchQueryModel
      .find({ query: new RegExp(`^${escapeRegExp(query)}`, 'i') })
      .sort({ count: -1 })
      .limit(limit)
      .exec();
    
    return suggestions.map(s => s.query);
  }

  private mapToSearchResults(devices: DeviceDocument[]): SearchResult[] {
    return devices.map(device => ({
      _id: device._id.toString(),
      name: device.name,
      slug: device.slug,
      brand: device.brand,
      category: (device as any).category?.name || 'Device',
      imageUrl: device.imageUrl,
    }));
  }

  private async logSearchQuery(query: string): Promise<void> {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery || normalizedQuery.length < 3) return;

    await this.searchQueryModel.findOneAndUpdate(
      { query: normalizedQuery },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    ).exec();
  }

  async getPopularQueries(limit: number = 10): Promise<SearchQuery[]> {
    return this.searchQueryModel.find().sort({ count: -1 }).limit(limit).exec();
  }
}
