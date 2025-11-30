import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Device } from '../devices/device.schema';

export type PriceHistoryDocument = PriceHistory & Document;

@Schema({ timestamps: true })
export class PriceHistory {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Device' })
  device: Device;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, default: 'USD' })
  currency: string;

  @Prop()
  retailer?: string;

  @Prop()
  affiliateUrl?: string;

  @Prop({ required: true, default: Date.now })
  date: Date;
}

export const PriceHistorySchema = SchemaFactory.createForClass(PriceHistory);