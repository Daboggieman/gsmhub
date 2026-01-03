import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' }] })
  favorites: mongoose.Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
