// src/audit-logs/dto/create-audit-log.dto.ts
import { IsNotEmpty, IsEnum, IsOptional, IsUUID, IsObject, IsString } from 'class-validator';
import { ActionType } from '../entities/audit-log.entity';

export class CreateAuditLogDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsEnum(ActionType)
  action: ActionType;

  @IsNotEmpty()
  @IsString()
  resource: string;

  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsOptional()
  @IsObject()
  details?: Record<string, any>;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}