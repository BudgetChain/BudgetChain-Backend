import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from '../../user/entities/audit_log.entity';

export interface AuditLogRepository extends Repository<AuditLog> {
  findByEntity(entityId: string, entityType: string): Promise<AuditLog[]>;
  findByAction(entityType: string, action: AuditAction): Promise<AuditLog[]>;
}