import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { BudgetProposal } from './budget-proposal.entity';

@Entity()
export class BudgetProposalMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  value: string;

  @Column()
  description: string;

  @ManyToOne(() => BudgetProposal, budget_proposal => budget_proposal.metrics)
  budget_proposal: BudgetProposal;
}
