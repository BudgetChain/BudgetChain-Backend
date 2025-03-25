import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Allocation, AllocationStatus } from '../entities/allocation.entity';

@Injectable()
export class AllocationRepository {
  constructor(
    @InjectRepository(Allocation)
    private allocationRepository: Repository<Allocation>,
  ) {}

  async findAll(): Promise<Allocation[]> {
    return this.allocationRepository.find();
  }

  async findById(id: string): Promise<Allocation | null> {
    return this.allocationRepository.findOne({ where: { id } });
  }

  async findByBudgetId(budgetId: string): Promise<Allocation[]> {
    return this.allocationRepository.find({
      where: { budgetId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: AllocationStatus): Promise<Allocation[]> {
    return this.allocationRepository.find({
      where: { status },
      order: { updatedAt: 'DESC' },
    });
  }

  async create(allocation: Partial<Allocation>): Promise<Allocation> {
    const newAllocation = this.allocationRepository.create(allocation);
    return this.allocationRepository.save(newAllocation);
  }

  async update(
    id: string,
    allocation: Partial<Allocation>,
  ): Promise<Allocation | null> {
    await this.allocationRepository.update(id, allocation);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.allocationRepository.delete(id);
  }
}
