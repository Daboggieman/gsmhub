import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CategoriesService } from './categories.service';
import { Category } from './category.schema';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let model: any;

  class MockCategoryModel {
    save: jest.Mock;
    constructor(private data: any) {
      this.save = jest.fn().mockResolvedValue(this.data);
    }
    static findOne = jest.fn();
    static find = jest.fn();
    static findById = jest.fn();
    static findByIdAndUpdate = jest.fn();
    static findByIdAndDelete = jest.fn();
    static countDocuments = jest.fn();
    static findOneAndUpdate = jest.fn();
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getModelToken(Category.name),
          useValue: MockCategoryModel,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    model = module.get(getModelToken(Category.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = { name: 'Smartphones', slug: 'smartphones' };

    it('should create a category successfully', async () => {
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.create(createDto);
      expect(result).toEqual(expect.objectContaining(createDto));
      expect(model.findOne).toHaveBeenCalled();
    });

    it('should throw ConflictException if category exists', async () => {
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'existing', ...createDto }),
      });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const categories = [{ name: 'A' }, { name: 'B' }];
      model.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(categories),
        }),
      });

      const result = await service.findAll();
      expect(result).toEqual(categories);
    });

    it('should filter by search term', async () => {
      model.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      await service.findAll('phone');
      expect(model.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            { name: expect.any(Object) },
            { slug: expect.any(Object) },
          ]),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a category if found', async () => {
      const category = { _id: '1', name: 'Test' };
      model.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(category),
      });

      const result = await service.findOne('1');
      expect(result).toEqual(category);
    });

    it('should throw NotFoundException if not found', async () => {
      model.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySlug', () => {
    it('should return a category if found', async () => {
      const category = { _id: '1', slug: 'test' };
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(category),
      });

      const result = await service.findBySlug('test');
      expect(result).toEqual(category);
    });

    it('should throw NotFoundException if not found', async () => {
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findBySlug('test')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto = { name: 'Updated' };
    const existing = { _id: '1', name: 'Old' };

    it('should update category successfully', async () => {
      // No conflict
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      model.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...existing, ...updateDto }),
      });

      const result = await service.update('1', updateDto);
      expect(result.name).toBe('Updated');
    });

    it('should throw ConflictException if renamed to existing category', async () => {
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'other', name: 'Updated' }),
      });

      await expect(service.update('1', { name: 'Updated' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException if category to update is not found', async () => {
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      model.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update('1', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove category successfully', async () => {
      model.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: '1' }),
      });

      await service.remove('1');
      expect(model.findByIdAndDelete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if category not found', async () => {
      model.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('upsertCategory', () => {
    it('should upsert a category', async () => {
      const data = { slug: 'test', name: 'Test' };
      model.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(data),
      });

      const result = await service.upsertCategory(data);
      expect(result).toEqual(data);
      expect(model.findOneAndUpdate).toHaveBeenCalled();
    });
  });
});
