import { IsString, IsOptional, IsUUID, IsBoolean, IsObject, IsDateString, MinLength, MaxLength } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  slug: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  brand: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  model: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  category: string;

  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  image_url?: string;

  @IsOptional()
  @IsDateString()
  release_date?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsObject()
  specs?: Record<string, any>;
}
