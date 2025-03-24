import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Treasury } from './treasury.entity';
import { Allocation } from './allocation.entity';

export enum BudgetStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  treasuryId: string;

  @ManyToOne(() => Treasury, treasury => treasury.budgets)
  @JoinColumn({ name: 'treasuryId' })
  treasury: Treasury;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  allocatedAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  spentAmount: number;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: BudgetStatus,
    default: BudgetStatus.DRAFT,
  })
  status: BudgetStatus;

  @Column({ type: 'jsonb', default: '[]' })
  categories: string[];

  @Column({ type: 'text', default: '' })
  notes: string;

  @Column({ type: 'timestamp', nullable: true })
  submissionDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  approvalDate: Date;

  @OneToMany(() => Allocation, allocation => allocation.budget)
  allocations: Allocation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}