import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum EntityType {
  TREASURY = 'treasury',
  ASSET = 'asset',
  TRANSACTION = 'transaction',
  BUDGET = 'budget',
  ALLOCATION = 'allocation',
  RISK_ASSESSMENT = 'risk_assessment',
}

export enum ActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  treasuryId: string;

  @Column({
    type: 'enum',
    enum: EntityType,
  })
  entityType: EntityType;

  @Column()
  entityId: string;

  @Column({
    type: 'enum',
    enum: ActionType,
  })
  action: ActionType;

  @Column()
  userId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column({ type: 'jsonb', nullable: true })
  previousState: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newState: Record<string, any>;

  @Column({ nullable: true })
  ipAddress: string;
}
