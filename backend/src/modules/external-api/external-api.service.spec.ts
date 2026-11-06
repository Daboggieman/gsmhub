import { Test, TestingModule } from '@nestjs/testing';
import { ExternalApiService } from './external-api.service';
import { GsmarenaScraperService } from './gsmarena-scraper.service';
import { HttpException } from '@nestjs/common';
import { DeviceType } from '@shared/types';

describe('ExternalApiService', () => {
  let service: ExternalApiService;
  let scraper: any;

  const mockScraper = {
    fetchBrands: jest.fn().mockResolvedValue([]),
    fetchDevicesByBrand: jest.fn().mockResolvedValue([]),
    fetchDeviceSpecs: jest.fn().mockResolvedValue(null),
    fetchSpecsByModel: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExternalApiService,
        { provide: GsmarenaScraperService, useValue: mockScraper },
      ],
    }).compile();

    service = module.get<ExternalApiService>(ExternalApiService);
    scraper = module.get(GsmarenaScraperService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchDeviceSpecs', () => {
    it('should return scraper specs via the raw slug when available', async () => {
      const mockResult = { name: 'Device' };
      scraper.fetchDeviceSpecs.mockResolvedValueOnce(mockResult);

      const result = await service.fetchDeviceSpecs(
        'Brand',
        'Model',
        'brand-model-123.php',
      );

      expect(scraper.fetchDeviceSpecs).toHaveBeenCalledWith(
        'brand-model-123.php',
        'Brand',
        'Model',
      );
      expect(scraper.fetchSpecsByModel).not.toHaveBeenCalled();
      expect(result).toBe(mockResult);
    });

    it('should fall back to fetchSpecsByModel when no raw slug is known', async () => {
      const mockResult = { name: 'Device By Model' };
      scraper.fetchSpecsByModel.mockResolvedValueOnce(mockResult);

      const result = await service.fetchDeviceSpecs('Brand', 'Model');

      expect(scraper.fetchSpecsByModel).toHaveBeenCalledWith('Brand', 'Model');
      expect(scraper.fetchDeviceSpecs).not.toHaveBeenCalled();
      expect(result).toBe(mockResult);
    });

    it('should throw HttpException when the scraper returns nothing', async () => {
      await expect(service.fetchDeviceSpecs('Brand', 'Model')).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw HttpException when the scraper errors', async () => {
      scraper.fetchSpecsByModel.mockRejectedValueOnce(
        new Error('HTTP 403 for https://www.gsmarena.com/brand-model.php'),
      );

      await expect(service.fetchDeviceSpecs('Brand', 'Model')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('fetchAvailableBrands', () => {
    it('should return brands from the scraper', async () => {
      scraper.fetchBrands.mockResolvedValueOnce(['Apple', 'Samsung']);

      const result = await service.fetchAvailableBrands();

      expect(result).toEqual(['Apple', 'Samsung']);
    });

    it('should return an empty list when the scraper fails', async () => {
      scraper.fetchBrands.mockRejectedValueOnce(new Error('HTTP 503'));

      const result = await service.fetchAvailableBrands();

      expect(result).toEqual([]);
    });
  });

  describe('fetchDevicesByBrand', () => {
    it('should map scraper items into device partials', async () => {
      scraper.fetchDevicesByBrand.mockResolvedValueOnce([
        { name: 'Galaxy S24', slug: 'galaxy_s24-12814.php', imageUrl: 'x.jpg' },
      ]);

      const result = await service.fetchDevicesByBrand('Samsung');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        model: 'Galaxy S24',
        brand: 'Samsung',
        rawSlug: 'galaxy_s24-12814.php',
        imageUrl: 'x.jpg',
        isActive: true,
        specs: [],
      });
    });

    it('should return an empty list when the scraper comes up empty', async () => {
      scraper.fetchDevicesByBrand.mockResolvedValueOnce([]);

      const result = await service.fetchDevicesByBrand('Samsung');

      expect(result).toEqual([]);
    });

    it('should return an empty list when the scraper fails', async () => {
      scraper.fetchDevicesByBrand.mockRejectedValueOnce(new Error('HTTP 429'));

      const result = await service.fetchDevicesByBrand('Samsung');

      expect(result).toEqual([]);
    });

    describe('type classification', () => {
      it.each([
        ['Galaxy S24', DeviceType.PHONE],
        ['iPhone 15 Pro', DeviceType.PHONE],
        ['Xperia 1 VI', DeviceType.PHONE],
        ['Galaxy Tab S9 Ultra', DeviceType.TABLET],
        ['iPad Pro 13 (2024)', DeviceType.TABLET],
        ['MatePad Pro 12.2', DeviceType.TABLET],
        ['Galaxy Watch 7', DeviceType.SMARTWATCH],
        ['Apple Watch Series 10', DeviceType.SMARTWATCH],
        ['Watch GT 4', DeviceType.SMARTWATCH],
        ['Galaxy Buds3 Pro', DeviceType.ACCESSORY],
        ['AirPods Pro 2', DeviceType.ACCESSORY],
        ['WF-1000XM5', DeviceType.ACCESSORY],
      ])('classifies "%s" as %s', async (name, expectedType) => {
        scraper.fetchDevicesByBrand.mockResolvedValueOnce([
          { name, slug: 'some_device-1.php' },
        ]);

        const result = await service.fetchDevicesByBrand('Brand');

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe(expectedType);
      });
    });
  });
});
