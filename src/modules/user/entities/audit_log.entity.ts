import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsNotEmpty, IsString, IsDate, IsEnum, Length } from 'class-validator';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  entityId: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  @Length(1, 50)
  entityType: string;

  @Column({ type: 'enum', enum: AuditAction })
  @IsEnum(AuditAction)
  action: AuditAction;

  @Column()
  @IsDate()
  timestamp: Date;

  @Column({ nullable: true })
  @IsString()
  userId: string;
}

export interface IAuditLog {
  id: string;
  entityId: string;
  entityType: string;
  action: AuditAction;
  timestamp: Date;
  userId: string | null;
}