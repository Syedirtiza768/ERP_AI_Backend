// src/audit-logs/audit-logs.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, ActionType } from './entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogsRepository: Repository<AuditLog>,
  ) {}

  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogsRepository.create(createAuditLogDto);
    return this.auditLogsRepository.save(auditLog);
  }

  async findAll(page = 1, limit = 10): Promise<{ data: AuditLog[]; total: number }> {
    const [data, total] = await this.auditLogsRepository.findAndCount({
      order: { timestamp: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async findByUser(userId: string, page = 1, limit = 10): Promise<{ data: AuditLog[]; total: number }> {
    const [data, total] = await this.auditLogsRepository.findAndCount({
      where: { userId },
      order: { timestamp: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async findByResource(resource: string, page = 1, limit = 10): Promise<{ data: AuditLog[]; total: number }> {
    const [data, total] = await this.auditLogsRepository.findAndCount({
      where: { resource },
      order: { timestamp: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async findByAction(action: ActionType, page = 1, limit = 10): Promise<{ data: AuditLog[]; total: number }> {
    const [data, total] = await this.auditLogsRepository.findAndCount({
      where: { action },
      order: { timestamp: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }
}