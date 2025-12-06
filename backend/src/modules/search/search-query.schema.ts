import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SearchQueryDocument = SearchQuery & Document;

@Schema({ timestamps: true })
export class SearchQuery {
  @Prop({ required: true, unique: true, index: true })
  query: string;

  @Prop({ default: 1 })
  count: number;
}

export const SearchQuerySchema = SchemaFactory.createForClass(SearchQuery);
