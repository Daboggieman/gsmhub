import { IsBoolean, IsDateString, IsNumber, IsObject, IsString, IsOptional } from 'class-validator';
import { CategoryResponseDto } from '../../categories/dto/category-response.dto';
import { Expose, Transform, Type } from 'class-transformer';

export class DeviceResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id ? obj._id.toString() : '')
  _id: string;

  @Expose()
  @Transform(({ obj }) => obj._id ? obj._id.toString() : '') 
  id: string; // Keep alias for flexibility

  @IsString()
  slug: string;

  @IsString()
  brand: string;

  @IsString()
  model: string;

  @Type(() => CategoryResponseDto)
  category: CategoryResponseDto; 

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsObject()
  @IsOptional()
  specs?: any;

  @IsNumber()
  @IsOptional()
  latestPrice?: number; // Added to include the latest price

  @IsNumber()
  views: number;

  @IsBoolean()
  isActive: boolean;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;
}
