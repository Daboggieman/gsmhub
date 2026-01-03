import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
    private readonly logger = new Logger(AuditLogInterceptor.name);

    constructor(private readonly auditLogService: AuditLogService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, user, ip } = request;
        const userAgent = request.get('user-agent');

        // Only log write operations (POST, PATCH, DELETE) and if user is present (admin)
        if (!['POST', 'PATCH', 'DELETE'].includes(method) || !user) {
            return next.handle();
        }

        // Skip some routes if needed (e.g., auth login)
        if (url.includes('/auth/login')) {
            return next.handle();
        }

        return next.handle().pipe(
            tap({
                next: (data) => {
                    // Determine action and target from URL and method
                    const parts = url.split('/').filter(p => p && !p.startsWith('?'));
                    const action = `${method}_${parts[0]?.toUpperCase() || 'UNKNOWN'}`;

                    let targetType = parts[0] || 'unknown';
                    let targetId = parts[1] || data?._id || 'unknown';

                    // Special handling for some routes
                    if (targetType === 'devices' && parts[1] === 'sync') {
                        targetType = 'DeviceSync';
                        targetId = body.model || 'unknown';
                    }

                    this.auditLogService.create({
                        user: user._id,
                        action,
                        targetType,
                        targetId: String(targetId),
                        details: {
                            url,
                            method,
                            body: this.sanitizeBody(body),
                        },
                        ipAddress: ip,
                        userAgent,
                    }).catch(err => this.logger.error('Failed to save audit log', err));
                },
            }),
        );
    }

    private sanitizeBody(body: any) {
        if (!body) return body;
        const sensitiveFields = ['password', 'token', 'secret'];
        const sanitized = { ...body };
        sensitiveFields.forEach(field => {
            if (field in sanitized) sanitized[field] = '***';
        });
        return sanitized;
    }
}
