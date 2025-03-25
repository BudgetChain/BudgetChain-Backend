import { Injectable } from '@nestjs/common';
import { BudgetRepository } from '../repositories/budget.repository';
import { Budget, BudgetStatus } from '../entities/budget.entity';
import { AuditLogService } from './audit-log.service';
import { EntityType, ActionType } from '../entities/audit-log.entity';

@Injectable()
export class BudgetService {
  constructor(
    private budgetRepository: BudgetRepository,
    private auditLogService: AuditLogService,
  ) {}

  async findAll(): Promise<Budget[]> {
    return this.budgetRepository.findAll();
  }

  async findById(id: string): Promise<Budget | null> {
    return this.budgetRepository.findById(id);
  }

  async findByTreasuryId(treasuryId: string): Promise<Budget[]> {
    return this.budgetRepository.findByTreasuryId(treasuryId);
  }

  async findByStatus(status: BudgetStatus): Promise<Budget[]> {
    return this.budgetRepository.findByStatus(status);
  }

  async create(budget: Partial<Budget>, userId: string): Promise<Budget> {
    const newBudget = await this.budgetRepository.create(budget);

    // Log the creation action
    await this.auditLogService.logAction({
      treasuryId: newBudget.treasuryId,
      entityType: EntityType.BUDGET,
      entityId: newBudget.id,
      action: ActionType.CREATE,
      userId,
      previousState: null,
      newState: newBudget,
    });

    return newBudget;
  }

  async update(
    id: string,
    budget: Partial<Budget>,
    userId: string,
  ): Promise<Budget | null> {
    const existingBudget = await this.budgetRepository.findById(id);
    if (!existingBudget) throw new Error('No existing budget found');
    const updatedBudget = await this.budgetRepository.update(id, budget);

    // Log the update action
    await this.auditLogService.logAction({
      treasuryId: existingBudget.treasuryId,
      entityType: EntityType.BUDGET,
      entityId: id,
      action: ActionType.UPDATE,
      userId,
      previousState: existingBudget,
      newState: updatedBudget,
    });

    return updatedBudget;
  }

  async delete(id: string, userId: string): Promise<void> {
    const existingBudget = await this.budgetRepository.findById(id);
    if (!existingBudget) throw new Error('No existing budget found');
    await this.budgetRepository.delete(id);

    // Log the delete action
    await this.auditLogService.logAction({
      treasuryId: existingBudget.treasuryId,
      entityType: EntityType.BUDGET,
      entityId: id,
      action: ActionType.DELETE,
      userId,
      previousState: existingBudget,
      newState: null,
    });
  }

  async submitBudget(id: string, userId: string): Promise<Budget> {
    const budget = await this.budgetRepository.findById(id);

    if (!budget) throw new Error('No new budget found');

    if (budget.status === BudgetStatus.DRAFT) {
      const updatedBudget = await this.budgetRepository.update(id, {
        status: BudgetStatus.SUBMITTED,
        submissionDate: new Date(),
      });

      if (!updatedBudget) throw new Error('No updated budget');

      // Log the update action
      await this.auditLogService.logAction({
        treasuryId: budget.treasuryId,
        entityType: EntityType.BUDGET,
        entityId: id,
        action: ActionType.UPDATE,
        userId,
        previousState: budget,
        newState: updatedBudget,
      });

      return updatedBudget;
    }

    return budget;
  }

  async approveBudget(id: string, userId: string): Promise<Budget | null> {
    const budget = await this.budgetRepository.findById(id);

    if (!budget) throw new Error('Budget not found');

    if (
      budget.status === BudgetStatus.SUBMITTED ||
      budget.status === BudgetStatus.UNDER_REVIEW
    ) {
      const updatedBudget = await this.budgetRepository.update(id, {
        status: BudgetStatus.APPROVED,
        approvalDate: new Date(),
      });

      // Log the update action
      await this.auditLogService.logAction({
        treasuryId: budget.treasuryId,
        entityType: EntityType.BUDGET,
        entityId: id,
        action: ActionType.UPDATE,
        userId,
        previousState: budget,
        newState: updatedBudget,
      });

      return updatedBudget;
    }

    return budget;
  }

  async rejectBudget(id: string, userId: string): Promise<Budget | null> {
    const budget = await this.budgetRepository.findById(id);

    if (!budget) throw new Error('no budget found');

    if (
      budget.status === BudgetStatus.SUBMITTED ||
      budget.status === BudgetStatus.UNDER_REVIEW
    ) {
      const updatedBudget = await this.budgetRepository.update(id, {
        status: BudgetStatus.REJECTED,
        approvalDate: new Date(),
      });

      // Log the update action
      await this.auditLogService.logAction({
        treasuryId: budget.treasuryId,
        entityType: EntityType.BUDGET,
        entityId: id,
        action: ActionType.UPDATE,
        userId,
        previousState: budget,
        newState: updatedBudget,
      });

      return updatedBudget;
    }

    return budget;
  }
}
