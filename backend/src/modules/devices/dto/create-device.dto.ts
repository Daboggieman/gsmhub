import { IsString, IsOptional, IsBoolean, IsArray, IsNumber, IsEnum } from 'class-validator';
import { DeviceType } from '../../../../../shared/src/types';

export class CreateDeviceDto {
  @IsString()
  slug: string;

  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsEnum(DeviceType)
  @IsOptional()
  type?: DeviceType;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  releaseDate?: string;

  @IsString()
  @IsOptional()
  dimension?: string;

  @IsString()
  @IsOptional()
  os?: string;

  @IsString()
  @IsOptional()
  storage?: string;

  @IsString()
  @IsOptional()
  displaySize?: string;

  @IsString()
  @IsOptional()
  ram?: string;

  @IsString()
  @IsOptional()
  battery?: string;

  @IsString()
  @IsOptional()
  weight?: string;

  @IsString()
  @IsOptional()
  chipset?: string;

  @IsString()
  @IsOptional()
  mainCamera?: string;

  @IsString()
  @IsOptional()
  selfieCamera?: string;

  @IsString()
  @IsOptional()
  videoResolution?: string;

  @IsString()
  @IsOptional()
  versions?: string;

  @IsString()
  @IsOptional()
  models?: string;

  @IsString()
  @IsOptional()
  colors?: string;

  @IsString()
  @IsOptional()
  sarEU?: string;

  @IsString()
  @IsOptional()
  networkTechnology?: string;

  @IsString()
  @IsOptional()
  reviewTeaser?: string;

  @IsArray()
  @IsOptional()
  specs?: any[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}