import { IsBoolean, IsDateString, IsNumber, IsObject, IsString, IsOptional } from 'class-validator';
import { Category } from 'src/modules/categories/category.schema'; // Assuming Category is also a DTO or a simple type
import { Expose, Transform } from 'class-transformer';

export class DeviceResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id.toString()) // Transform _id to id
  id: string; // MongoDB _id is a string

  @IsString()
  slug: string;

  @IsString()
  brand: string;

  @IsString()
  model: string;

  // Assuming category will be a string ID in the DTO response, or a nested DTO
  // For now, keeping it as Category from schema for simplicity, but will likely need a CategoryResponseDto
  @IsObject()
  category: Category; 

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsObject()
  @IsOptional()
  specs?: any;

  @IsNumber()
  views: number;

  @IsBoolean()
  isActive: boolean;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;
}
