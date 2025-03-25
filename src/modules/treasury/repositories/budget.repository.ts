import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget, BudgetStatus } from '../entities/budget.entity';

@Injectable()
export class BudgetRepository {
  constructor(
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
  ) {}

  async findAll(): Promise<Budget[]> {
    return this.budgetRepository.find();
  }

  async findById(id: string): Promise<Budget | null> {
    return this.budgetRepository.findOne({ where: { id } });
  }

  async findByTreasuryId(treasuryId: string): Promise<Budget[]> {
    return this.budgetRepository.find({
      where: { treasuryId },
      order: { startDate: 'DESC' },
    });
  }

  async findByStatus(status: BudgetStatus): Promise<Budget[]> {
    return this.budgetRepository.find({
      where: { status },
      order: { submissionDate: 'DESC' },
    });
  }

  async create(budget: Partial<Budget>): Promise<Budget> {
    const newBudget = this.budgetRepository.create(budget);
    return this.budgetRepository.save(newBudget);
  }

  async update(id: string, budget: Partial<Budget>): Promise<Budget | null> {
    await this.budgetRepository.update(id, budget);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.budgetRepository.delete(id);
  }
}
