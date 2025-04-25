import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export enum AuditLogAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  @IsNotEmpty()
  @IsString()
  entityId: string;

  @Column({ type: 'varchar', length: 50 })
  @IsNotEmpty()
  @IsString()
  entityType: string;

  @Column({ type: 'enum', enum: AuditLogAction })
  @IsEnum(AuditLogAction)
  action: AuditLogAction;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column({ type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  userId: string | null;
}

export interface IAuditLog {
  id: string;
  entityId: string;
  entityType: string;
  action: AuditLogAction;
  timestamp: Date;
  userId: string | null;
}
