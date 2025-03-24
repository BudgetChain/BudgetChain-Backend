import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Budget } from './budget.entity';

export enum AllocationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  RELEASED = 'released',
  SPENT = 'spent',
  CANCELLED = 'cancelled',
}

@Entity('allocations')
export class Allocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  budgetId: string;

  @ManyToOne(() => Budget, budget => budget.allocations)
  @JoinColumn({ name: 'budgetId' })
  budget: Budget;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  recipientId: string;

  @Column({
    type: 'enum',
    enum: AllocationStatus,
    default: AllocationStatus.PENDING,
  })
  status: AllocationStatus;

  @Column({ type: 'jsonb', default: '[]' })
  tags: string[];

  @Column({ type: 'text', default: '' })
  notes: string;

  @Column({ type: 'jsonb', default: '[]' })
  approvers: Array<{ userId: string; timestamp: Date }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  releasedAt: Date;
}