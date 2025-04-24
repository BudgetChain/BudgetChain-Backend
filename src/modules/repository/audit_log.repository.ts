import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from '../user/entities/audit_log.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

export interface AuditLogRepository extends Repository<AuditLog> {
  findByEntity(entityId: string, entityType: string): Promise<AuditLog[]>;
  findByAction(entityType: string, action: AuditAction): Promise<AuditLog[]>;
}

@Injectable()
export class AuditLogRepositoryImpl extends Repository<AuditLog> implements AuditLogRepository {
  constructor(@InjectRepository(AuditLog) private readonly repo: Repository<AuditLog>) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  // Create
  async createAuditLog(auditLog: Partial<AuditLog>): Promise<AuditLog> {
    const newAuditLog = this.repo.create(auditLog);
    return this.repo.save(newAuditLog);
  }

  // Read (Single)
  async findById(id: string): Promise<AuditLog | null> {
    return this.repo.findOne({ where: { id } });
  }

  // Read (Multiple)
  async findAll(): Promise<AuditLog[]> {
    return this.repo.find();
  }

  // Read (Custom)
  async findByEntity(entityId: string, entityType: string): Promise<AuditLog[]> {
    return this.repo.find({ where: { entityId, entityType } });
  }

  async findByAction(entityType: string, action: AuditAction): Promise<AuditLog[]> {
    return this.repo.find({ where: { entityType, action } });
  }

  // Update
  async updateAuditLog(id: string, updateData: Partial<AuditLog>): Promise<AuditLog | null> {
    await this.repo.update(id, updateData);
    return this.findById(id);
  }

  // Delete
  async deleteAuditLog(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}