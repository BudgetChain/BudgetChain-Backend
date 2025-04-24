import { Repository } from 'typeorm';
import { Budget } from '../user/entities/budget.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';



export interface BudgetRepository extends Repository<Budget> {
  findByTreasuryId(treasuryId: string): Promise<Budget[]>;
  findByPeriod(treasuryId: string, period: string): Promise<Budget[]>;
}

@Injectable()
export class BudgetRepositoryImpl extends Repository<Budget> implements BudgetRepository {
  constructor(@InjectRepository(Budget) private readonly repo: Repository<Budget>) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  // Create
  async createBudget(budget: Partial<Budget>): Promise<Budget> {
    const newBudget = this.repo.create(budget);
    return this.repo.save(newBudget);
  }

  // Read (Single)
  async findById(id: string): Promise<Budget | null> {
    return this.repo.findOne({ where: { id } });
  }

  // Read (Multiple)
  async findAll(): Promise<Budget[]> {
    return this.repo.find();
  }

  // Read (Custom)
  async findByTreasuryId(treasuryId: string): Promise<Budget[]> {
    return this.repo.find({ where: { treasuryId } });
  }

  async findByPeriod(treasuryId: string, period: string): Promise<Budget[]> {
    return this.repo.find({ where: { treasuryId, period } });
  }

  // Update
  async updateBudget(id: string, updateData: Partial<Budget>): Promise<Budget | null> {
    await this.repo.update(id, updateData);
    return this.findById(id);
  }

  // Delete
  async deleteBudget(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}