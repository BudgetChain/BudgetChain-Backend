import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  entityName: string; // e.g., 'Transaction'

  @Column()
  entityId: number;

  @Column({ type: 'enum', enum: ['create', 'update', 'delete'] })
  action: 'create' | 'update' | 'delete';

  @Column({ type: 'json' })
  changes: any; // Stores before/after values

  @ManyToOne(() => User)
  user: User;

  @CreateDateColumn()
  timestamp: Date;
}