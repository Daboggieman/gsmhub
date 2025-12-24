import { IsBoolean, IsDateString, IsNumber, IsObject, IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { CategoryResponseDto } from '../../categories/dto/category-response.dto';
import { Expose, Transform, Type } from 'class-transformer';
import { DeviceType } from '../../../../../shared/src/types';

export class DeviceResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id ? obj._id.toString() : '')
  _id: string;

  @Expose()
  @Transform(({ obj }) => obj._id ? obj._id.toString() : '') 
  id: string; 

  @Expose()
  @IsString()
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
  @IsEnum(DeviceType)
  type: DeviceType;

  @Expose()
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @Expose()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @Expose()
  @IsString()
  @IsOptional()
  description?: string;

  @Expose()
  @IsString()
  @IsOptional()
  releaseDate?: string;

  @Expose()
  @IsString()
  @IsOptional()
  dimension?: string;

  @Expose()
  @IsString()
  @IsOptional()
  os?: string;

  @Expose()
  @IsString()
  @IsOptional()
  storage?: string;

  @Expose()
  @IsString()
  @IsOptional()
  displaySize?: string;

  @Expose()
  @IsString()
  @IsOptional()
  ram?: string;

  @Expose()
  @IsString()
  @IsOptional()
  battery?: string;

  @Expose()
  @IsString()
  @IsOptional()
  weight?: string;

  @Expose()
  @IsString()
  @IsOptional()
  chipset?: string;

  @Expose()
  @IsString()
  @IsOptional()
  mainCamera?: string;

  @Expose()
  @IsString()
  @IsOptional()
  selfieCamera?: string;

  @Expose()
  @IsString()
  @IsOptional()
  videoResolution?: string;

  @Expose()
  @IsString()
  @IsOptional()
  versions?: string;

  @Expose()
  @IsString()
  @IsOptional()
  models?: string;

  @Expose()
  @IsString()
  @IsOptional()
  colors?: string;

  @Expose()
  @IsString()
  @IsOptional()
  sarEU?: string;

  @Expose()
  @IsString()
  @IsOptional()
  networkTechnology?: string;

  @Expose()
  @IsString()
  @IsOptional()
  reviewTeaser?: string;

  @Expose()
  @IsArray()
  @IsOptional()
  specs?: any[];

  @Expose()
  @IsNumber()
  @IsOptional()
  latestPrice?: number; 

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
