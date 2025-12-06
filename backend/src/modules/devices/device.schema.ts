import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Category } from '../categories/category.schema';

export type DeviceDocument = Device & Document;

@Schema({ _id: false })
class DeviceSpec {
  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  value: string;
}

const DeviceSpecSchema = SchemaFactory.createForClass(DeviceSpec);

@Schema({ timestamps: true })
export class Device {
  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ required: true, index: true })
  brand: string;

  @Prop({ required: true })
  model: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
  category: Category;

  @Prop()
  imageUrl?: string;

  @Prop({ type: [DeviceSpecSchema] })
  specs: DeviceSpec[];

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  description?: string;

  @Prop()
  releaseDate?: string;

  @Prop()
  dimension?: string;

  @Prop()
  os?: string;

  @Prop()
  storage?: string;

  @Prop()
  displaySize?: string;

  @Prop()
  ram?: string;

  @Prop()
  battery?: string;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
DeviceSchema.index({ '$**': 'text' });