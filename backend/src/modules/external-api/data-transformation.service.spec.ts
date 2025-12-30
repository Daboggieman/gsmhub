import { Test, TestingModule } from '@nestjs/testing';
import { DataTransformationService } from './data-transformation.service';
import { DeviceType } from '@shared/types';

describe('DataTransformationService', () => {
  let service: DataTransformationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataTransformationService],
    }).compile();

    service = module.get<DataTransformationService>(DataTransformationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('transformPrimaryDevice (GSMArena Parser)', () => {
    it('should correctly transform a full primary device payload', () => {
      const mockData = {
        model: 'Pixel 8 Pro',
        manufacturer: 'Google',
        chipset: 'Google Tensor G3',
        cpu: 'Nona-core',
        gpu: 'Immortalis-G715 MC10',
        androidVersion: '14',
        displaySize: '6.7 inches',
        displayResolution: '1344 x 2992 pixels',
        displayType: 'LTPO OLED, 120Hz',
        internal:
          '128GB 12GB RAM, 256GB 12GB RAM, 512GB 12GB RAM, 1TB 12GB RAM',
        mainCameraSpecs: '50 MP (wide) + 48 MP (telephoto) + 48 MP (ultrawide)',
        battery: '5050 mAh',
        sensors:
          'Fingerprint (under display, optical), accelerometer, gyro, proximity, compass, barometer, thermometer',
        img: 'https://example.com/pixel8pro.jpg',
        customField: 'Some value',
      };

      const result = service.transformPrimaryDevice(
        mockData,
        'Google',
        'Pixel 8 Pro',
      );

      expect(result.model).toBe('Pixel 8 Pro');
      expect(result.brand).toBe('Google');
      expect(result.slug).toBe('google-pixel-8-pro');
      expect(result.imageUrl).toBe('https://example.com/pixel8pro.jpg');
      expect(result.os).toBe('Android 14');
      expect(result.ram).toBe('12GB');
      expect(result.storage).toBe('128GB');
      expect(result.isActive).toBe(true);

      // Verify specs array
      const chipsetSpec = result.specs?.find((s) => s.key === 'Chipset');
      expect(chipsetSpec?.value).toBe('Google Tensor G3');
      expect(chipsetSpec?.category).toBe('Platform');

      const customSpec = result.specs?.find((s) => s.key === 'Custom Field');
      expect(customSpec?.value).toBe('Some value');
      expect(customSpec?.category).toBe('General');
    });

    it('should handle missing fields gracefully', () => {
      const mockData = { model: 'S24', manufacturer: 'Samsung' };
      const result = service.transformPrimaryDevice(mockData, 'Samsung', 'S24');

      expect(result.model).toBe('S24');
      expect(result.chipset).toBeUndefined();
      expect(result.specs).toBeDefined();
      expect(result.specs?.length).toBe(0);
    });
  });

  describe('transformSecondaryDevice (Mobile Device Hardware Specs)', () => {
    it('should correctly transform a secondary device payload', () => {
      const mockData = {
        name: 'Galaxy S23 Ultra',
        dimensions: '163.4 x 78.1 x 8.9 mm',
        weight: '234 g',
        displaySize: '6.8 inches',
        chipset: 'Snapdragon 8 Gen 2',
        batteryType: 'Li-Ion 5000 mAh',
        colors: 'Phantom Black, Green',
      };

      const result = service.transformSecondaryDevice(
        mockData,
        'Samsung',
        'Galaxy S23 Ultra',
      );

      expect(result.model).toBe('Galaxy S23 Ultra');
      expect(result.brand).toBe('Samsung');
      expect(result.dimension).toBe('163.4 x 78.1 x 8.9 mm');
      expect(result.battery).toBe('Li-Ion 5000 mAh');

      const colorSpec = result.specs?.find((s) => s.key === 'Colors');
      expect(colorSpec?.category).toBe('Misc');
    });
  });

  describe('Utility Extraction', () => {
    it('should extract RAM correctly', () => {
      expect((service as any).extractRam('128GB 8GB RAM')).toBe('8GB');
      expect(
        (service as any).extractRam('256GB 12GB RAM, 512GB 12GB RAM'),
      ).toBe('12GB');
      expect((service as any).extractRam('64GB 4GB RAM')).toBe('4GB');
      expect((service as any).extractRam('No info')).toBe('');
    });

    it('should extract Storage correctly', () => {
      expect((service as any).extractStorage('128GB 8GB RAM')).toBe('128GB');
      expect((service as any).extractStorage('1TB 12GB RAM')).toBe('1TB');
      expect((service as any).extractStorage('512MB 512MB RAM')).toBe('512MB');
      expect((service as any).extractStorage('Invalid')).toBe('');
    });
  });
});
