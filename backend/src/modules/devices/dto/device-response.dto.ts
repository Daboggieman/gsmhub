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

  @Expose()
  @Transform(({ obj }) => `${obj.brand} ${obj.model}`)
  name: string;

  @Expose()
  @IsString()
  slug: string;

  @Expose()
  @IsString()
  brand: string;

  @Expose()
  @IsString()
  model: string;

  @Expose()
  @Type(() => CategoryResponseDto)
  category: CategoryResponseDto; 

  @Expose()
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @Expose()
  @IsObject()
  @IsOptional()
  specs?: any;

  @Expose()
  @IsNumber()
  @IsOptional()
  latestPrice?: number; // Added to include the latest price

  @Expose()
  @IsNumber()
  views: number;

  @Expose()
  @IsBoolean()
  isActive: boolean;

  @Expose()
  @IsDateString()
  createdAt: Date;

  @Expose()
  @IsDateString()
  updatedAt: Date;
}
