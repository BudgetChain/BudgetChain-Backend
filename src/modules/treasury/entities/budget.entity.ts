import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Allocation } from './allocation.entity';
import { BudgetProposal } from 'src/modules/budget-proposal/entities/budget-proposal.entity';

export enum BudgetStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CLOSED = 'closed',
  EXPIRED = 'expired',
}

@Entity('treasury_budgets')
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: BudgetStatus,
    default: BudgetStatus.DRAFT,
  })
  status: BudgetStatus;

  @Column({ type: 'decimal', precision: 36, scale: 18, default: 0 })
  totalAmount: string;

  @Column({ type: 'decimal', precision: 36, scale: 18, default: 0 })
  allocatedAmount: string;

  @Column({ type: 'decimal', precision: 36, scale: 18, default: 0 })
  spentAmount: string;

  @Column({ nullable: true })
  startDate?: Date;

  @Column({ nullable: true })
  endDate?: Date;

  @Column({ nullable: true })
  ownerId?: string;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @OneToMany(() => Allocation, allocation => allocation.budget)
  allocations: Allocation[];

  @OneToMany(() => BudgetProposal, budget_proposal => budget_proposal.treasury)
  budget_proposals: BudgetProposal[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
