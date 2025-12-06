import { Expose, Transform } from 'class-transformer';
import { IsString } from 'class-validator';

export class CategoryResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  id: string;

  @IsString()
  name: string;

  @IsString()
  slug: string;
}
