import { Repository } from 'typeorm';
import { Allocation } from '../user/entities/allocation.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';


export interface AllocationRepository extends Repository<Allocation> {
  findByBudgetId(budgetId: string): Promise<Allocation[]>;
  findByPurpose(budgetId: string, purpose: string): Promise<Allocation[]>;
}

@Injectable()
export class AllocationRepositoryImpl extends Repository<Allocation> implements AllocationRepository {
  constructor(@InjectRepository(Allocation) private readonly repo: Repository<Allocation>) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  // Create
  async createAllocation(allocation: Partial<Allocation>): Promise<Allocation> {
    const newAllocation = this.repo.create(allocation);
    return this.repo.save(newAllocation);
  }

  // Read (Single)
  async findById(id: string): Promise<Allocation | null> {
    return this.repo.findOne({ where: { id } });
  }

  // Read (Multiple)
  async findAll(): Promise<Allocation[]> {
    return this.repo.find();
  }

  // Read (Custom)
  async findByBudgetId(budgetId: string): Promise<Allocation[]> {
    return this.repo.find({ where: { budgetId } });
  }

  async findByPurpose(budgetId: string, purpose: string): Promise<Allocation[]> {
    return this.repo.find({ where: { budgetId, purpose } });
  }

  // Update
  async updateAllocation(id: string, updateData: Partial<Allocation>): Promise<Allocation | null> {
    await this.repo.update(id, updateData);
    return this.findById(id);
  }

  // Delete
  async deleteAllocation(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}