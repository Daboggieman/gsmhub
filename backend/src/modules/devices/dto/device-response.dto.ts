import { Expose, Transform } from 'class-transformer';

export class DeviceResponseDto {
  @Expose()
  id: string;

  @Expose()
  slug: string;

  @Expose()
  brand: string;

  @Expose()
  model: string;

  @Expose()
  category: string;

  @Expose()
  category_id?: string;

  @Expose()
  image_url?: string;

  @Expose()
  release_date?: string;

  @Expose()
  views: number;

  @Expose()
  is_active: boolean;

  @Expose()
  specs: Record<string, any>;

  @Expose()
  @Transform(({ obj }) => obj.created_at)
  createdAt: Date;

  @Expose()
  @Transform(({ obj }) => obj.updated_at)
  updatedAt: Date;

  constructor(partial: Partial<DeviceResponseDto>) {
    Object.assign(this, partial);
  }
}
