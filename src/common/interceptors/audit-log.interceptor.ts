// src/common/interceptors/audit-log.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';
import { ActionType } from '../../audit-logs/entities/audit-log.entity';
import { Request } from 'express';
import { RequestUser } from '../interfaces/user.interface';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, path, params, query, body, user, ip, headers } = request;
    const requestUser = user as RequestUser;

    // Map HTTP method to ActionType
    const actionMap = {
      GET: ActionType.READ,
      POST: ActionType.CREATE,
      PATCH: ActionType.UPDATE,
      PUT: ActionType.UPDATE,
      DELETE: ActionType.DELETE,
    };

    // Extract resource from path (e.g., /users -> users)
    const resource = path.split('/')[1];

    // Extract resourceId from params if available
    const resourceId = params && Object.values(params).length > 0
      ? String(Object.values(params)[0])
      : undefined;

    return next.handle().pipe(
      tap(async (data) => {
        // Only log if user is authenticated
        if (requestUser && requestUser.id) {
          try {
            await this.auditLogsService.create({
              userId: requestUser.id,
              username: requestUser.username,
              action: actionMap[method] || ActionType.READ,
              resource,
              resourceId,
              details: {
                query,
                body: method !== 'GET' ? body : undefined,
                response: data,
              },
              ipAddress: ip || '127.0.0.1',
              userAgent: headers['user-agent'],
            });
          } catch (error) {
            console.error('Failed to create audit log:', error);
          }
        }
      }),
    );
  }
}