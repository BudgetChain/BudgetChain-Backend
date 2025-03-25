import { Injectable } from '@nestjs/common';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import { AuditLog, EntityType, ActionType } from '../entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(private auditLogRepository: AuditLogRepository) {}

  async findAll(): Promise<AuditLog[]> {
    return this.auditLogRepository.findAll();
  }

  async findById(id: string): Promise<AuditLog | null> {
    return this.auditLogRepository.findById(id);
  }

  async findByTreasuryId(treasuryId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.findByTreasuryId(treasuryId);
  }

  async findByEntityId(entityId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.findByEntityId(entityId);
  }

  async logAction(logData: {
    treasuryId: string;
    entityType: EntityType;
    entityId: string;
    action: ActionType;
    userId: string;
    previousState?: any;
    newState?: any;
    ipAddress?: string;
  }): Promise<AuditLog> {
    return this.auditLogRepository.create(logData);
  }
}
