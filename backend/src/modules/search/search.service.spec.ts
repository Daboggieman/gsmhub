import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SearchService } from './search.service';
import { Device } from '../devices/device.schema';
import { SearchQuery } from './search-query.schema';

describe('SearchService', () => {
  let service: SearchService;

  const findExec = jest.fn().mockResolvedValue([]);
  const findChain = {
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: findExec,
  };
  const mockDeviceModel = {
    find: jest.fn().mockReturnValue(findChain),
  };
  const mockSearchQueryModel = {
    findOneAndUpdate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
    find: jest.fn().mockReturnValue(findChain),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: getModelToken(Device.name),
          useValue: mockDeviceModel,
        },
        {
          provide: getModelToken(SearchQuery.name),
          useValue: mockSearchQueryModel,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns [] for whitespace-only queries', async () => {
    expect(await service.search('   ')).toEqual([]);
    expect(await service.search('')).toEqual([]);
  });

  it('does not use $text in the device query', async () => {
    await service.search('galaxy');
    const query = mockDeviceModel.find.mock.calls[0][0];
    expect(JSON.stringify(query)).not.toContain('$text');
  });
});
