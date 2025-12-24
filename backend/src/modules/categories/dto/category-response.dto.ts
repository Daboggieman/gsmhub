import { Expose, Transform } from 'class-transformer';
import { IsString, IsBoolean } from 'class-validator';

export class CategoryResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id ? obj._id.toString() : (obj.id ? obj.id.toString() : ''))
  id: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  slug: string;

  @Expose()
  @IsString()
  description: string;

  @Expose()
  @IsString()
  icon: string;

  @Expose()
  @IsBoolean()
  isActive: boolean;
}
