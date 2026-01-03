import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from './audit-log.schema';

@Injectable()
export class AuditLogService {
    constructor(
        @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
    ) { }

    async create(logData: Partial<AuditLog>): Promise<AuditLog> {
        const log = new this.auditLogModel(logData);
        return log.save();
    }

    async findAll(filters: {
        page?: number;
        limit?: number;
        userId?: string;
        action?: string;
        targetType?: string;
    }) {
        const { page = 1, limit = 20, userId, action, targetType } = filters;
        const query: any = {};

        if (userId) query.user = new Types.ObjectId(userId);
        if (action) query.action = action;
        if (targetType) query.targetType = targetType;

        const [logs, total] = await Promise.all([
            this.auditLogModel
                .find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('user', 'name email')
                .exec(),
            this.auditLogModel.countDocuments(query).exec(),
        ]);

        return { logs, total, page, limit };
    }
}
