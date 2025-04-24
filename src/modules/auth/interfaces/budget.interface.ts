import { Repository } from 'typeorm';
import { Budget } from '../../user/entities/budget.entity';

export interface BudgetRepository extends Repository<Budget> {
  findByTreasuryId(treasuryId: string): Promise<Budget[]>;
  findByPeriod(treasuryId: string, period: string): Promise<Budget[]>;
}