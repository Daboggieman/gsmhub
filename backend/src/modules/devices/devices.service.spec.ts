import { Test, TestingModule } from '@nestjs/testing';
import { DevicesService } from './devices.service';
import { DevicesRepository } from './devices.repository';
import { getModelToken } from '@nestjs/mongoose';
import { Category } from '../categories/category.schema';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CategoriesService } from '../categories/categories.service';
import { PricesService } from '../prices/prices.service';
import { ExternalApiService } from '../external-api/external-api.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('DevicesService', () => {
  let service: DevicesService;
  let repository: DevicesRepository;
  let cacheManager: any;
  let pricesService: PricesService;

  const mockDevice = {
    _id: new Types.ObjectId().toString(),
    name: 'Test Device',
    slug: 'test-device',
    brand: 'Test Brand',
    category: new Types.ObjectId().toString(),
  };

  const mockDevicesRepository = {
    findAll: jest.fn(),
    countAll: jest.fn(),
    findOne: jest.fn(),
    findBySlug: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findPopular: jest.fn(),
    findTrending: jest.fn(),
    findByCategory: jest.fn(),
    findByBrand: jest.fn(),
    incrementViewCount: jest.fn(),
    upsert: jest.fn(),
    getUniqueBrands: jest.fn(),
    getUniqueFieldValues: jest.fn(),
    getTotalViews: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockCategoryModel = {
    findById: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockCategoriesService = {
    upsertCategory: jest.fn(),
  };

  const mockPricesService = {
    findLatestPriceByDeviceId: jest.fn(),
    findLatestPricesByDeviceIds: jest.fn(),
  };

  const mockExternalApiService = {
    fetchDeviceSpecs: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesService,
        { provide: DevicesRepository, useValue: mockDevicesRepository },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: getModelToken(Category.name), useValue: mockCategoryModel },
        { provide: CategoriesService, useValue: mockCategoriesService },
        { provide: PricesService, useValue: mockPricesService },
        { provide: ExternalApiService, useValue: mockExternalApiService },
      ],
    }).compile();

    service = module.get<DevicesService>(DevicesService);
    repository = module.get<DevicesRepository>(DevicesRepository);
    cacheManager = module.get(CACHE_MANAGER);
    pricesService = module.get<PricesService>(PricesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findBySlug', () => {
    it('should return cached device if available', async () => {
      cacheManager.get.mockResolvedValue(mockDevice);
      
      const result = await service.findBySlug('test-device');
      
      expect(cacheManager.get).toHaveBeenCalledWith('device_test-device');
      expect(result.name).toBe(mockDevice.name);
    });

    it('should fetch from repository if not cached and then cache it', async () => {
      cacheManager.get.mockResolvedValue(null);
      mockDevicesRepository.findBySlug.mockResolvedValue(mockDevice);
      
      const result = await service.findBySlug('test-device');
      
      expect(mockDevicesRepository.findBySlug).toHaveBeenCalledWith('test-device');
      expect(cacheManager.set).toHaveBeenCalledWith('device_test-device', expect.any(Object), 3600);
      expect(result.name).toBe(mockDevice.name);
    });

    it('should throw NotFoundException if device not found', async () => {
      cacheManager.get.mockResolvedValue(null);
      mockDevicesRepository.findBySlug.mockResolvedValue(null);
      
      await expect(service.findBySlug('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new device', async () => {
      const createDto = { name: 'New Device', slug: 'new-device', brand: 'Brand', category: new Types.ObjectId().toString() };
      mockDevicesRepository.findBySlug.mockResolvedValue(null);
      mockCategoryModel.exec.mockResolvedValue({ _id: createDto.category });
      mockDevicesRepository.create.mockResolvedValue({ ...createDto, _id: 'new-id' });

      const result = await service.create(createDto);
      //const device = await service.findBySlug('new-device');

      expect(mockDevicesRepository.create).toHaveBeenCalled();
      expect(result.name).toBe(createDto.name);
    });

    it('should throw ConflictException if slug exists', async () => {
      const createDto = { name: 'New Device', slug: 'existing-device', brand: 'Brand' };
      mockDevicesRepository.findBySlug.mockResolvedValue(mockDevice);
      
      await expect(service.create(createDto as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('increaseViewCount', () => {
    it('should increment view count and invalidate cache', async () => {
      mockDevicesRepository.incrementViewCount.mockResolvedValue(mockDevice);
      
      await service.increaseViewCount('test-device');
      
      expect(mockDevicesRepository.incrementViewCount).toHaveBeenCalledWith('test-device');
      expect(cacheManager.del).toHaveBeenCalledWith('device_test-device');
      expect(cacheManager.del).toHaveBeenCalledWith('popular_devices');
    });
  });
});
