import { Test, TestingModule } from '@nestjs/testing';
import { ExternalApiService } from './external-api.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { DataTransformationService } from './data-transformation.service';
import { of, throwError } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('ExternalApiService', () => {
  let service: ExternalApiService;
  let httpService: any;
  let transformer: any;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      if (key === 'RAPIDAPI_KEY') return 'test-key';
      return defaultValue;
    }),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockTransformer = {
    transformPrimaryDevice: jest.fn(),
    transformSecondaryDevice: jest.fn(),
    transformPrimaryDeviceList: jest.fn(),
    transformSecondaryDeviceList: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExternalApiService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: DataTransformationService, useValue: mockTransformer },
      ],
    }).compile();

    service = module.get<ExternalApiService>(ExternalApiService);
    httpService = module.get(HttpService);
    transformer = module.get(DataTransformationService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchDeviceSpecs', () => {
    it('should return primary data if primary API succeeds', async () => {
      const mockResult = { name: 'Device' };
      httpService.get.mockReturnValue(of({ data: { raw: 'data' } }));
      transformer.transformPrimaryDevice.mockReturnValue(mockResult);

      const result = await service.fetchDeviceSpecs('Brand', 'Model');

      expect(httpService.get).toHaveBeenCalledWith(
        expect.stringContaining('gsmarenaparser'),
        expect.any(Object)
      );
      expect(result).toBe(mockResult);
    });

    it('should fallback to secondary if primary API fails', async () => {
      const mockResult = { name: 'Device Secondary' };
      // Primary fails
      httpService.get.mockReturnValueOnce(throwError(() => ({ 
        response: { status: 404, data: { message: 'Not Found' } } 
      })));
      // Secondary succeeds
      httpService.get.mockReturnValueOnce(of({ data: { raw: 'secondary' } }));
      transformer.transformSecondaryDevice.mockReturnValue(mockResult);

      const result = await service.fetchDeviceSpecs('Brand', 'Model');

      expect(httpService.get).toHaveBeenCalledTimes(2);
      expect(result).toBe(mockResult);
    });

    it('should throw HttpException if both APIs fail', async () => {
      httpService.get.mockReturnValue(throwError(() => ({ 
        response: { status: 404, data: { message: 'Not Found' } } 
      })));

      await expect(service.fetchDeviceSpecs('Brand', 'Model')).rejects.toThrow(HttpException);
    });
  });

  describe('fetchAvailableBrands', () => {
    it('should return brands from primary API', async () => {
      const brands = ['Apple', 'Samsung'];
      httpService.get.mockReturnValue(of({ data: brands }));

      const result = await service.fetchAvailableBrands();

      expect(result).toEqual(brands);
    });

    it('should fallback to secondary if primary fails', async () => {
      const brands = ['Apple', 'Samsung'];
      httpService.get.mockReturnValueOnce(throwError(() => new Error('API Error')));
      httpService.get.mockReturnValueOnce(of({ data: brands }));

      const result = await service.fetchAvailableBrands();

      expect(result).toEqual(brands);
    });
  });
});
