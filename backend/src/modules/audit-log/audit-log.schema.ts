import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../users/schemas/user.schema';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId | User;

    @Prop({ required: true })
    action: string;

    @Prop({ required: true })
    targetType: string;

    @Prop({ required: true })
    targetId: string;

    @Prop({ type: Object })
    details: any;

    @Prop()
    ipAddress?: string;

    @Prop()
    userAgent?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Add index for faster queries
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ user: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ targetType: 1, targetId: 1 });
