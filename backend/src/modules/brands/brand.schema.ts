import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BrandDocument = Brand & Document;

@Schema({ timestamps: true })
export class Brand {
  @Prop({ required: true, unique: true, index: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop()
  logoUrl?: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isFeatured: boolean;

  @Prop({ default: 0 })
  deviceCount: number;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);
