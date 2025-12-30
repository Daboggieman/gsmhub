import { Test, TestingModule } from '@nestjs/testing';
import { SyncService } from './sync.service';
import { ExternalApiService } from './external-api.service';
import { DevicesService } from '@modules/devices/devices.service';
import { CategoriesService } from '@modules/categories/categories.service';

describe('SyncService', () => {
  let service: SyncService;
  let externalApiService: any;
  let categoriesService: any;
  let devicesService: any;

  const mockExternalApiService = {
    fetchAvailableBrands: jest.fn(),
    fetchDevicesByBrand: jest.fn(),
  };

  const mockDevicesService = {
    upsertDevice: jest.fn(),
  };

  const mockCategoriesService = {
    upsertCategory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncService,
        { provide: ExternalApiService, useValue: mockExternalApiService },
        { provide: DevicesService, useValue: mockDevicesService },
        { provide: CategoriesService, useValue: mockCategoriesService },
      ],
    }).compile();

    service = module.get<SyncService>(SyncService);
    externalApiService = module.get(ExternalApiService);
    categoriesService = module.get(CategoriesService);
    devicesService = module.get(DevicesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fullSync', () => {
    it('should fetch brands and then fetch devices for each brand', async () => {
      const brands = ['Apple', 'Samsung'];
      const devices = [{ name: 'iPhone 15' }];
      
      externalApiService.fetchAvailableBrands.mockResolvedValue(brands);
      externalApiService.fetchDevicesByBrand.mockResolvedValue(devices);

      await service.fullSync();

      expect(externalApiService.fetchAvailableBrands).toHaveBeenCalled();
      expect(categoriesService.upsertCategory).toHaveBeenCalledTimes(2);
      expect(externalApiService.fetchDevicesByBrand).toHaveBeenCalledWith('Apple');
      expect(externalApiService.fetchDevicesByBrand).toHaveBeenCalledWith('Samsung');
      expect(devicesService.upsertDevice).toHaveBeenCalledTimes(2); // Once for each brand's device list (mocked to return same list)
    });

    it('should handle errors during brand sync gracefully', async () => {
      externalApiService.fetchAvailableBrands.mockRejectedValue(new Error('Fetch failed'));

      await service.fullSync();

      expect(externalApiService.fetchAvailableBrands).toHaveBeenCalled();
      expect(categoriesService.upsertCategory).not.toHaveBeenCalled();
    });
  });
});
