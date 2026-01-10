import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PricesService } from './prices.service';
import { PriceHistory } from './price-history.schema';
import { DevicesService } from '../devices/devices.service';
import { NotFoundException } from '@nestjs/common';

describe('PricesService', () => {
  let service: PricesService;
  let model: any;
  let devicesService: any;

  class MockPriceHistoryModel {
    constructor(private data: any) {}
    save = jest.fn().mockResolvedValue(this.data);
    static find = jest.fn();
    static findById = jest.fn();
    static findOne = jest.fn();
    static findByIdAndUpdate = jest.fn();
    static deleteOne = jest.fn();
    static aggregate = jest.fn();
  }

  const mockDevicesService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricesService,
        {
          provide: getModelToken(PriceHistory.name),
          useValue: MockPriceHistoryModel,
        },
        {
          provide: DevicesService,
          useValue: mockDevicesService,
        },
      ],
    }).compile();

    service = module.get<PricesService>(PricesService);
    model = module.get(getModelToken(PriceHistory.name));
    devicesService = module.get<DevicesService>(DevicesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a price history entry', async () => {
      const createDto = { device: 'dev1', price: 100, currency: 'USD' };
      devicesService.findOne.mockResolvedValue({ _id: 'dev1' });

      const result = await service.create(createDto);
      expect(devicesService.findOne).toHaveBeenCalledWith('dev1');
      expect(result).toEqual(expect.objectContaining({ price: 100 }));
    });
  });

  describe('findAll', () => {
    it('should return all prices', async () => {
      model.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });
      await service.findAll();
      expect(model.find).toHaveBeenCalled();
    });
  });

  describe('getPriceTrend', () => {
    it('should return stable trend if history < 2', async () => {
      model.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([{ price: 100 }]),
          }),
        }),
      });

      const result = await service.getPriceTrend('dev1');
      expect(result.trend).toBe('stable');
    });

    it('should return up trend if price increased', async () => {
      model.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([{ price: 110 }, { price: 100 }]),
          }),
        }),
      });

      const result = await service.getPriceTrend('dev1');
      expect(result.trend).toBe('up');
      expect(result.percentage).toBe(10);
    });
  });

  describe('getCurrentPrices', () => {
    it('should return aggregated prices', async () => {
      model.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ price: 100 }]),
      });

      const result = await service.getCurrentPrices('dev1');
      expect(result).toHaveLength(1);
      expect(model.aggregate).toHaveBeenCalled();
    });
  });
});
