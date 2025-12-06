import { IsBoolean, IsDateString, IsNumber, IsObject, IsString, IsOptional } from 'class-validator';
import { CategoryResponseDto } from '../../categories/dto/category-response.dto';
import { Expose, Transform, Type } from 'class-transformer';

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

  @Type(() => CategoryResponseDto)
  category: CategoryResponseDto; 

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
