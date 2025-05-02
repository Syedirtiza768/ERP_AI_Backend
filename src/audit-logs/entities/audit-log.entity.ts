// src/audit-logs/entities/audit-log.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum ActionType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
}

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  username: string;

  @Column({
    type: 'enum',
    enum: ActionType,
  })
  action: ActionType;

  @Column()
  resource: string;

  @Column({ nullable: true })
  resourceId: string;

  @Column({ type: 'json', nullable: true })
  details: Record<string, any>;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  timestamp: Date;
}