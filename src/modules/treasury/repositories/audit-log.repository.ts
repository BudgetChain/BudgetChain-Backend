import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditLogRepository {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async findAll(): Promise<AuditLog[]> {
    return this.auditLogRepository.find();
  }

  async findById(id: string): Promise<AuditLog | null> {
    return this.auditLogRepository.findOne({ where: { id } });
  }

  async findByTreasuryId(treasuryId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { treasuryId },
      order: { timestamp: 'DESC' },
    });
  }

  async findByEntityId(entityId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { entityId },
      order: { timestamp: 'DESC' },
    });
  }

  async create(auditLog: Partial<AuditLog>): Promise<AuditLog> {
    const newAuditLog = this.auditLogRepository.create(auditLog);
    return this.auditLogRepository.save(newAuditLog);
  }
}
