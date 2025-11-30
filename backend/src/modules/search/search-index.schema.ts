import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Device } from '../devices/device.schema';

export type SearchIndexDocument = SearchIndex & Document;

@Schema({ timestamps: true })
export class SearchIndex {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Device' })
  device: Device;

  @Prop({ required: true, text: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ required: true, text: true })
  brand: string;

  @Prop({ text: true })
  category: string;
}

export const SearchIndexSchema = SchemaFactory.createForClass(SearchIndex);
SearchIndexSchema.index({ name: 'text', brand: 'text', category: 'text' });