// src/audit-logs/audit-logs.controller.ts
import { Controller, Get, Query, Param } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { AuditLog, ActionType } from './entities/audit-log.entity';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{ data: AuditLog[]; total: number }> {
    return this.auditLogsService.findAll(+page, +limit);
  }

  @Get('user/:userId')
  findByUser(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{ data: AuditLog[]; total: number }> {
    return this.auditLogsService.findByUser(userId, +page, +limit);
  }

  @Get('resource/:resource')
  findByResource(
    @Param('resource') resource: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{ data: AuditLog[]; total: number }> {
    return this.auditLogsService.findByResource(resource, +page, +limit);
  }

  @Get('action/:action')
  findByAction(
    @Param('action') action: ActionType,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{ data: AuditLog[]; total: number }> {
    return this.auditLogsService.findByAction(action, +page, +limit);
  }
}