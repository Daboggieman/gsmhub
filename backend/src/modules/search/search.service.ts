import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device, DeviceDocument } from '../devices/device.schema';
import { SearchIndex, SearchIndexDocument } from './search-index.schema';
import { SearchQuery, SearchQueryDocument } from './search-query.schema';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    @InjectModel(SearchIndex.name) private searchIndexModel: Model<SearchIndexDocument>,
    @InjectModel(SearchQuery.name) private searchQueryModel: Model<SearchQueryDocument>,
  ) {}

  async search(query: string, limit: number = 10): Promise<Device[]> {
    // Log the search query
    this.logSearchQuery(query);

    return this.deviceModel
      .find({ $text: { $search: query } }, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .exec();
  }

  async getAutocomplete(query: string, limit: number = 5): Promise<string[]> {
    if (!query) {
      return [];
    }
    const searchRegex = new RegExp(query, 'i');
    const devices = await this.deviceModel
      .find({
        $or: [
          { name: searchRegex },
          { brand: searchRegex },
          { model: searchRegex },
        ],
      })
      .limit(limit)
      .exec();
    
    // Return a list of device names as suggestions
    return devices.map(device => device.name);
  }

  async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    // For now, suggestions will be similar to autocomplete
    return this.getAutocomplete(query, limit);
  }

  private async logSearchQuery(query: string): Promise<void> {
    const searchQuery = await this.searchQueryModel.findOne({ query });
    if (searchQuery) {
      searchQuery.count++;
      await searchQuery.save();
    } else {
      await this.searchQueryModel.create({ query, count: 1 });
    }
  }
}