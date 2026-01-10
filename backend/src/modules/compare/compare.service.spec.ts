import { Test, TestingModule } from '@nestjs/testing';
import { CompareService } from './compare.service';
import { DevicesService } from '../devices/devices.service';
import { NotFoundException } from '@nestjs/common';

describe('CompareService', () => {
  let service: CompareService;
  let devicesService: any;

  const mockDevicesService = {
    findBySlug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompareService,
        {
          provide: DevicesService,
          useValue: mockDevicesService,
        },
      ],
    }).compile();

    service = module.get<CompareService>(CompareService);
    devicesService = module.get<DevicesService>(DevicesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('compareDevices', () => {
    it('should return two devices if found', async () => {
      const devA = { slug: 'a', name: 'Device A' };
      const devB = { slug: 'b', name: 'Device B' };
      mockDevicesService.findBySlug
        .mockResolvedValueOnce(devA)
        .mockResolvedValueOnce(devB);

      const result = await service.compareDevices('a', 'b');
      expect(result.deviceA).toEqual(devA);
      expect(result.deviceB).toEqual(devB);
    });

    it('should throw NotFoundException if device A not found', async () => {
      mockDevicesService.findBySlug.mockResolvedValueOnce(null);
      await expect(service.compareDevices('a', 'b')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getDetailedComparison', () => {
    it('should return comparison data', async () => {
      const devA = {
        slug: 'a',
        name: 'Device A',
        specs: [
          { category: 'Display', key: 'Size', value: '6.1 inches' },
          { category: 'Battery', key: 'Capacity', value: '4000 mAh' },
        ],
      };
      const devB = {
        slug: 'b',
        name: 'Device B',
        specs: [
          { category: 'Display', key: 'Size', value: '6.7 inches' },
          { category: 'Battery', key: 'Capacity', value: '5000 mAh' },
        ],
      };

      mockDevicesService.findBySlug.mockImplementation((slug) => {
        if (slug === 'a') return Promise.resolve(devA);
        if (slug === 'b') return Promise.resolve(devB);
        return Promise.resolve(null);
      });

      const result = await service.getDetailedComparison(['a', 'b']);

      expect(result.devices).toHaveLength(2);
      expect(result.comparison).toBeDefined();

      const sizeRow = result.comparison.find((r) => r.item === 'Size');
      expect(sizeRow).toBeDefined();
      expect(sizeRow?.values).toEqual(['6.1 inches', '6.7 inches']);
      // 6.7 - 6.1 = 0.6. Display size higher is better.
      expect(sizeRow?.difference).toBe('+0.6');
      expect(sizeRow?.betterIndex).toBe(1);

      const battRow = result.comparison.find((r) => r.item === 'Capacity');
      expect(battRow?.difference).toBe('+1000.0');
      expect(battRow?.betterIndex).toBe(1);
    });
  });
});
