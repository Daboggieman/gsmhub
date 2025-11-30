import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  slug: string;

  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsString() // Expecting category ID as a string from the client
  category: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsObject()
  @IsOptional()
  specs?: any;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}