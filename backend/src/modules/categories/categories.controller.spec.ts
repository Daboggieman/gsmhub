import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { DevicesService } from '../devices/devices.service';
import { CategoryResponseDto } from './dto/category-response.dto';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let categoriesService: any;
  let devicesService: any;

  const mockCategoriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findBySlug: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockDevicesService = {
    getDevicesByCategory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        { provide: CategoriesService, useValue: mockCategoriesService },
        { provide: DevicesService, useValue: mockDevicesService },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    categoriesService = module.get<CategoriesService>(CategoriesService);
    devicesService = module.get<DevicesService>(DevicesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const result = [{ name: 'Test' }];
      mockCategoriesService.findAll.mockResolvedValue(result);

      const response = await controller.findAll();
      expect(response).toEqual(expect.any(Array));
      expect(response[0]).toBeInstanceOf(CategoryResponseDto);
    });
  });

  describe('findOne', () => {
    it('should return a category by slug', async () => {
      const result = { name: 'Test', slug: 'test' };
      mockCategoriesService.findBySlug.mockResolvedValue(result);

      const response = await controller.findOne('test');
      expect(response).toEqual(expect.any(CategoryResponseDto));
      expect(response.slug).toBe('test');
    });
  });

  describe('create', () => {
    it('should create a category', async () => {
      const dto = { name: 'New' };
      const result = { _id: '1', ...dto };
      mockCategoriesService.create.mockResolvedValue(result);

      const response = await controller.create(dto);
      expect(response).toEqual(expect.any(CategoryResponseDto));
    });
  });

  describe('findDevicesByCategory', () => {
    it('should return devices for a category', async () => {
      mockCategoriesService.findBySlug.mockResolvedValue({
        _id: '1',
        slug: 'cat',
      });
      mockDevicesService.getDevicesByCategory.mockResolvedValue([]);

      await controller.findDevicesByCategory('cat');
      expect(devicesService.getDevicesByCategory).toHaveBeenCalledWith('1', 50);
    });
  });
});
