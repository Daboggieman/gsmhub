import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { getModelToken } from '@nestjs/mongoose';
import { Device } from '../devices/device.schema';
import { SearchIndex } from './search-index.schema';
import { SearchQuery } from './search-query.schema';
import { Types } from 'mongoose';

describe('SearchService', () => {
  let service: SearchService;
  let deviceModel: any;
  let searchQueryModel: any;

  const mockDevice = {
    _id: new Types.ObjectId(),
    name: 'Test iPhone 15',
    slug: 'test-iphone-15',
    brand: 'Apple',
    imageUrl: 'http://example.com/image.jpg',
    isActive: true,
  };

  const mockDeviceModel = {
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockSearchIndexModel = {
    find: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockSearchQueryModel = {
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    findOneAndUpdate: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: getModelToken(Device.name), useValue: mockDeviceModel },
        { provide: getModelToken(SearchIndex.name), useValue: mockSearchIndexModel },
        { provide: getModelToken(SearchQuery.name), useValue: mockSearchQueryModel },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    deviceModel = module.get(getModelToken(Device.name));
    searchQueryModel = module.get(getModelToken(SearchQuery.name));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('should return empty array if no query provided', async () => {
      const result = await service.search('');
      expect(result).toEqual([]);
    });

    it('should return mapped search results', async () => {
      mockDeviceModel.exec.mockResolvedValue([mockDevice]);
      
      const result = await service.search('iphone');
      
      expect(deviceModel.find).toHaveBeenCalled();
      expect(result.length).toBe(1);
      expect(result[0].name).toBe(mockDevice.name);
      expect(result[0]._id).toBe(mockDevice._id.toString());
    });

    it('should log search query if query is long enough', async () => {
      mockDeviceModel.exec.mockResolvedValue([]);
      
      await service.search('iphone 15');
      
      expect(searchQueryModel.findOneAndUpdate).toHaveBeenCalledWith(
        { query: 'iphone 15' },
        { $inc: { count: 1 } },
        { upsert: true, new: true }
      );
    });

    it('should escape regex special characters', async () => {
      mockDeviceModel.exec.mockResolvedValue([]);
      
      await service.search('iphone (15)');
      
      const regexArg = deviceModel.find.mock.calls[0][0].$or[1].name;
      expect(regexArg.source).toBe('iphone \\(15\\)');
    });
  });

  describe('getAutocomplete', () => {
    it('should return empty array if query is too short', async () => {
      const result = await service.getAutocomplete('i');
      expect(result).toEqual([]);
    });

    it('should fetch results for valid query length', async () => {
      mockDeviceModel.exec.mockResolvedValue([mockDevice]);
      
      const result = await service.getAutocomplete('iph');
      
      expect(deviceModel.find).toHaveBeenCalled();
      expect(result.length).toBe(1);
    });
  });

  describe('getSuggestions', () => {
    it('should return suggestion strings', async () => {
      mockSearchQueryModel.exec.mockResolvedValue([{ query: 'iphone' }, { query: 'iphone 15' }]);
      
      const result = await service.getSuggestions('iph');
      
      expect(searchQueryModel.find).toHaveBeenCalledWith({
        query: new RegExp('^iph', 'i')
      });
      expect(result).toEqual(['iphone', 'iphone 15']);
    });
  });

  describe('getPopularQueries', () => {
    it('should return sorted popular queries', async () => {
      mockSearchQueryModel.exec.mockResolvedValue([{ query: 'iphone', count: 10 }]);
      
      const result = await service.getPopularQueries(5);
      
      expect(searchQueryModel.find).toHaveBeenCalled();
      expect(searchQueryModel.sort).toHaveBeenCalledWith({ count: -1 });
      expect(searchQueryModel.limit).toHaveBeenCalledWith(5);
      expect(result).toEqual([{ query: 'iphone', count: 10 }]);
    });
  });
});
