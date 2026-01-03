import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Category } from '../categories/category.schema';
import { DeviceType } from '../../../../shared/src/types';

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
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ required: true, index: true })
  brand: string;

  @Prop({ required: true })
  model: string;

  @Prop({ type: String, enum: DeviceType, default: DeviceType.PHONE })
  type: DeviceType;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true })
  category: Category;

  @Prop()
  imageUrl?: string;

  @Prop({ type: [String] })
  images?: string[];

  @Prop({ type: [DeviceSpecSchema] })
  specs: DeviceSpec[];

  @Prop({ default: 0, index: true })
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

  @Prop({ index: true })
  ramValue?: number; // RAM in GB

  @Prop()
  battery?: string;

  @Prop({ index: true })
  batteryValue?: number; // Battery in mAh

  @Prop()
  latestPrice?: number;

  @Prop()
  weight?: string;

  @Prop()
  chipset?: string;

  @Prop()
  mainCamera?: string;

  @Prop()
  selfieCamera?: string;

  @Prop()
  videoResolution?: string;

  @Prop()
  versions?: string;

  @Prop()
  models?: string;

  @Prop()
  colors?: string;

  @Prop()
  sarEU?: string;

  @Prop()
  networkTechnology?: string;

  @Prop()
  reviewTeaser?: string;

  @Prop({ index: true })
  storageValue?: number; // Storage in GB

  @Prop({ index: true })
  displaySizeValue?: number; // Display size in inches

  @Prop({ type: [{ user: String, date: String, text: String, avatarInitials: String }] })
  opinions?: { user: string; date: string; text: string; avatarInitials?: string }[];
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
DeviceSchema.index({ createdAt: -1 });
DeviceSchema.index({ updatedAt: -1 });
DeviceSchema.index({ '$**': 'text' });