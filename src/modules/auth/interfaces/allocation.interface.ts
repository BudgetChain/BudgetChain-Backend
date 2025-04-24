import { Repository } from 'typeorm';
import { Allocation } from '../../user/entities/allocation.entity';

export interface AllocationRepository extends Repository<Allocation> {
  findByBudgetId(budgetId: string): Promise<Allocation[]>;
  findByPurpose(budgetId: string, purpose: string): Promise<Allocation[]>;
}