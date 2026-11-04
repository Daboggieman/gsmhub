import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device, DeviceDocument } from '../devices/device.schema';
import { SearchQuery, SearchQueryDocument } from './search-query.schema';
import { SearchResult } from '@shared/types';
import { escapeRegExp } from '@shared/utils/regex';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    @InjectModel(SearchQuery.name)
    private searchQueryModel: Model<SearchQueryDocument>,
  ) {}

  async search(query: string, limit: number = 10): Promise<SearchResult[]> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return [];

    // Log the search query for analytics (best-effort, never blocks or throws)
    void this.logSearchQuery(query).catch(() => {});

    const searchRegex = new RegExp(escapeRegExp(trimmedQuery), 'i');

    // Regex search on name/brand/model — same approach as DevicesRepository.
    // ($text cannot be used inside $or, so a combined query always throws.)
    let devices = await this.deviceModel
      .find({
        $or: [
          { name: searchRegex },
          { brand: searchRegex },
          { model: searchRegex },
        ],
        isActive: true,
      })
      .sort({ views: -1 })
      .limit(limit)
      .exec();

    // Fallback: If no results, try broader search (split query into words)
    if (devices.length === 0 && trimmedQuery.includes(' ')) {
      const words = trimmedQuery.split(/\s+/).filter((w) => w.length > 2);
      if (words.length > 0) {
        devices = await this.deviceModel
          .find({
            $or: words.map((word) => ({
              $or: [
                { name: new RegExp(escapeRegExp(word), 'i') },
                { brand: new RegExp(escapeRegExp(word), 'i') },
              ],
            })),
            isActive: true,
          })
          .sort({ views: -1 })
          .limit(limit)
          .exec();
      }
    }

    return this.mapToSearchResults(devices);
  }

  async getAutocomplete(
    query: string,
    limit: number = 8,
  ): Promise<SearchResult[]> {
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
        isActive: true,
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

    return suggestions.map((s) => s.query);
  }

  private mapToSearchResults(devices: DeviceDocument[]): SearchResult[] {
    return devices.map((device) => ({
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

    try {
      await this.searchQueryModel
        .findOneAndUpdate(
          { query: normalizedQuery },
          { $inc: { count: 1 } },
          { upsert: true, new: true },
        )
        .exec();
    } catch {
      // Analytics is best-effort: tolerate concurrent-upsert E11000 races
      // and transient DB errors without crashing the process.
    }
  }

  async getPopularQueries(limit: number = 10): Promise<SearchQuery[]> {
    return this.searchQueryModel.find().sort({ count: -1 }).limit(limit).exec();
  }
}
