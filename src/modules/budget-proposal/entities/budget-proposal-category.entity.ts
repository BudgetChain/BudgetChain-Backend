import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { BudgetProposal } from './budget-proposal.entity';

@Entity()
export class BudgetProposalCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column()
  description: string;

  @ManyToOne(() => BudgetProposal, budget_proposal => budget_proposal.categories)
  budget_proposal: BudgetProposal;
}
