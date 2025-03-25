import { Injectable } from '@nestjs/common';
import { AllocationRepository } from '../repositories/allocation.repository';
import { BudgetRepository } from '../repositories/budget.repository';
import { Allocation, AllocationStatus } from '../entities/allocation.entity';
import { AuditLogService } from './audit-log.service';
import { EntityType, ActionType } from '../entities/audit-log.entity';

@Injectable()
export class AllocationService {
  constructor(
    private allocationRepository: AllocationRepository,
    private budgetRepository: BudgetRepository,
    private auditLogService: AuditLogService,
  ) {}

  async findAll(): Promise<Allocation[]> {
    return this.allocationRepository.findAll();
  }

  async findById(id: string): Promise<Allocation | null> {
    return this.allocationRepository.findById(id);
  }

  async findByBudgetId(budgetId: string): Promise<Allocation[]> {
    return this.allocationRepository.findByBudgetId(budgetId);
  }

  async findByStatus(status: AllocationStatus): Promise<Allocation[]> {
    return this.allocationRepository.findByStatus(status);
  }

  async create(
    allocation: Partial<Allocation>,
    userId: string,
  ): Promise<Allocation | null> {
    const newAllocation = await this.allocationRepository.create(allocation);

    // Update the budget's allocated amount
    const budget = await this.budgetRepository.findById(newAllocation.budgetId);
    if (!budget) {
      throw new Error('Budget Not Found');
    }
    const newAllocatedAmount =
      Number(budget.allocatedAmount) + Number(newAllocation.amount);
    await this.budgetRepository.update(budget.id, {
      allocatedAmount: newAllocatedAmount,
    });

    // Log the creation action
    await this.auditLogService.logAction({
      treasuryId: budget.treasuryId,
      entityType: EntityType.ALLOCATION,
      entityId: newAllocation.id,
      action: ActionType.CREATE,
      userId,
      previousState: null,
      newState: newAllocation,
    });

    return newAllocation;
  }

  async update(
    id: string,
    allocation: Partial<Allocation>,
    userId: string,
  ): Promise<Allocation> {
    const existingAllocation = await this.allocationRepository.findById(id);
    const updatedAllocation = await this.allocationRepository.update(
      id,
      allocation,
    );

    if (!existingAllocation || !updatedAllocation) {
      throw new Error('No existing/updated allocation');
    }

    // If amount changed, update the budget's allocated amount
    if (allocation.amount && existingAllocation.amount !== allocation.amount) {
      const budget = await this.budgetRepository.findById(
        existingAllocation.budgetId,
      );

      if (!budget) throw new Error('Budget not found');

      const amountDifference =
        Number(allocation.amount) - Number(existingAllocation.amount);
      const newAllocatedAmount =
        Number(budget.allocatedAmount) + amountDifference;
      await this.budgetRepository.update(budget.id, {
        allocatedAmount: newAllocatedAmount,
      });
    }

    // Log the update action
    const budget = await this.budgetRepository.findById(
      existingAllocation.budgetId,
    );

    if (!budget) throw new Error('Budget not found');

    await this.auditLogService.logAction({
      treasuryId: budget.treasuryId,
      entityType: EntityType.ALLOCATION,
      entityId: id,
      action: ActionType.UPDATE,
      userId,
      previousState: existingAllocation,
      newState: updatedAllocation,
    });

    return updatedAllocation;
  }

  async delete(id: string, userId: string): Promise<void> {
    const existingAllocation = await this.allocationRepository.findById(id);

    if (!existingAllocation) throw new Error('No existing Allocation');

    // Update the budget's allocated amount
    const budget = await this.budgetRepository.findById(
      existingAllocation.budgetId,
    );

    if (!budget) throw new Error('No Budget Found');

    const newAllocatedAmount =
      Number(budget.allocatedAmount) - Number(existingAllocation.amount);
    await this.budgetRepository.update(budget.id, {
      allocatedAmount: newAllocatedAmount,
    });

    await this.allocationRepository.delete(id);

    // Log the delete action
    await this.auditLogService.logAction({
      treasuryId: budget.treasuryId,
      entityType: EntityType.ALLOCATION,
      entityId: id,
      action: ActionType.DELETE,
      userId,
      previousState: existingAllocation,
      newState: null,
    });
  }

  async approveAllocation(
    id: string,
    userId: string,
  ): Promise<Allocation | null> {
    const allocation = await this.allocationRepository.findById(id);

    if (!allocation) throw new Error('Allocation not found');

    if (allocation.status === AllocationStatus.PENDING) {
      const updatedAllocation = await this.allocationRepository.update(id, {
        status: AllocationStatus.APPROVED,
        approvers: [
          ...(allocation.approvers || []),
          { userId, timestamp: new Date() },
        ],
      });

      // Log the update action
      const budget = await this.budgetRepository.findById(allocation.budgetId);

      if (!budget) throw new Error('Budget not found');

      await this.auditLogService.logAction({
        treasuryId: budget.treasuryId,
        entityType: EntityType.ALLOCATION,
        entityId: id,
        action: ActionType.UPDATE,
        userId,
        previousState: allocation,
        newState: updatedAllocation,
      });

      return updatedAllocation;
    }

    return allocation;
  }

  async releaseAllocation(
    id: string,
    userId: string,
  ): Promise<Allocation | null> {
    const allocation = await this.allocationRepository.findById(id);

    if (!allocation) throw new Error('No allocation found');

    if (allocation.status === AllocationStatus.APPROVED) {
      const updatedAllocation = await this.allocationRepository.update(id, {
        status: AllocationStatus.RELEASED,
        releasedAt: new Date(),
      });

      // Log the update action
      const budget = await this.budgetRepository.findById(allocation.budgetId);
      if (!budget) throw new Error('Budget not found');
      await this.auditLogService.logAction({
        treasuryId: budget.treasuryId,
        entityType: EntityType.ALLOCATION,
        entityId: id,
        action: ActionType.UPDATE,
        userId,
        previousState: allocation,
        newState: updatedAllocation,
      });

      return updatedAllocation;
    }
    return allocation;
  }
}
