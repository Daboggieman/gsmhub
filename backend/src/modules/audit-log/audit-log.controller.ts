import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService) { }

    @Get()
    async findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('userId') userId?: string,
        @Query('action') action?: string,
        @Query('targetType') targetType?: string,
    ) {
        return this.auditLogService.findAll({
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
            userId,
            action,
            targetType,
        });
    }
}
