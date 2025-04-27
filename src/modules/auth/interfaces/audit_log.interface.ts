import { Repository } from 'typeorm';
import { AuditLog, AuditLogAction } from '../../user/entities/audit_log.entity';

export interface AuditLogRepository extends Repository<AuditLog> {
  findByEntity(entityId: string, entityType: string): Promise<AuditLog[]>;
  findByAction(entityType: string, action: AuditLogAction): Promise<AuditLog[]>;
}
