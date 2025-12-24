import { Expose, Transform } from 'class-transformer';

export class BrandResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  id: string;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  logoUrl?: string;

  @Expose()
  description?: string;

  @Expose()
  isFeatured: boolean;

  @Expose()
  deviceCount: number;
}
