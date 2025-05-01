import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { Budget as Treasury } from '../../treasury/entities/budget.entity';
import { User } from '../../user/entities/user.entity';
import { BudgetProposalComment } from './budget-proposal-comment.entity';
import { BudgetProposalCategory } from './budget-proposal-category.entity';
import { BudgetProposalMetric } from './budget-proposal-metric.entity';

export enum BudgetProposalStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  UNDER_REVIEW = 'Under Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

@Entity('budget_proposals')
export class BudgetProposal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Treasury, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'treasuryId' })
  treasury: Treasury;

  @Column()
  treasuryId: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  department: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'submitterId' })
  submitter: User;

  @Column()
  submitterId: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  requestedAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  allocatedAmount: number | null;

  @Column({
    type: 'enum',
    enum: BudgetProposalStatus,
    default: BudgetProposalStatus.DRAFT,
  })
  status: BudgetProposalStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score: number | null;

  @OneToMany(() => BudgetProposalCategory, category => category.budget_proposal, {
    cascade: true,
  })
  categories: BudgetProposalCategory[];

  @OneToMany(() => BudgetProposalMetric, metric => metric.budget_proposal, {
    cascade: true,
  })
  metrics: BudgetProposalMetric[];

  @Column('simple-array', { nullable: true })
  supportingDocuments: string[];

  @Column({ type: 'timestamp', nullable: true })
  submissionDate: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  approvalDate: Date | null;

  @OneToMany(() => BudgetProposalComment, comment => comment.budget_proposal)
  comments: BudgetProposalComment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;
}
