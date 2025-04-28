import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Budget, BudgetStatus } from '../entities/budget.entity';
import { LoggingService } from '../../../config/logging.service';
import {
  formatErrorMessage,
  NotFoundError,
  DatabaseError,
  ValidationError,
  BusinessLogicError,
} from '../../../shared/erros/app-error';
import BigNumber from 'bignumber.js';

@Injectable()
export class TreasuryBudgetService {
  constructor(
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
    @Inject(LoggingService)
    private logger: LoggingService,
    private dataSource: DataSource
  ) {
    this.logger.setContext('TreasuryBudgetService');
    // Configure BigNumber for precision
    BigNumber.config({
      DECIMAL_PLACES: 18,
      ROUNDING_MODE: BigNumber.ROUND_DOWN,
    });
  }

  /**
   * Find all budgets
   */
  async findAll(status?: BudgetStatus, ownerId?: string): Promise<Budget[]> {
    try {
      const queryBuilder = this.budgetRepository.createQueryBuilder('budget');

      if (status) {
        queryBuilder.andWhere('budget.status = :status', { status });
      }

      if (ownerId) {
        queryBuilder.andWhere('budget.ownerId = :ownerId', { ownerId });
      }

      queryBuilder.leftJoinAndSelect('budget.allocations', 'allocations');
      queryBuilder.orderBy('budget.createdAt', 'DESC');

      const budgets = await queryBuilder.getMany();
      this.logger.debug(`Retrieved ${budgets.length} budgets`);
      return budgets;
    } catch (error) {
      this.logger.error(
        `Error retrieving budgets: ${formatErrorMessage(error)}`
      );
      throw new DatabaseError(
        `Failed to retrieve budgets: ${formatErrorMessage(error)}`
      );
    }
  }

  /**
   * Find budget by ID
   */
  async findById(id: string): Promise<Budget> {
    try {
      const budget = await this.budgetRepository.findOne({
        where: { id },
        relations: ['allocations'],
      });

      if (!budget) {
        this.logger.warn(`Budget with ID ${id} not found`);
        throw new NotFoundError('Budget', id);
      }

      return budget;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      this.logger.error(
        `Error finding budget by ID ${id}: ${formatErrorMessage(error)}`
      );
      throw new DatabaseError(
        `Failed to find budget: ${formatErrorMessage(error)}`
      );
    }
  }

  /**
   * Create a new budget
   */
  async create(budgetData: Partial<Budget>): Promise<Budget> {
    try {
      // Validate required fields
      if (!budgetData.name) {
        throw new ValidationError('Budget name is required');
      }

      if (budgetData.totalAmount) {
        const amount = new BigNumber(budgetData.totalAmount);
        if (amount.isNaN() || amount.isLessThan(0)) {
          throw new ValidationError(
            'Budget amount must be a non-negative number'
          );
        }
      } else {
        budgetData.totalAmount = '0';
      }

      // Set default values
      budgetData.allocatedAmount = '0';
      budgetData.spentAmount = '0';
      budgetData.status = budgetData.status || BudgetStatus.DRAFT;

      // Validate dates
      if (budgetData.startDate && budgetData.endDate) {
        if (new Date(budgetData.startDate) > new Date(budgetData.endDate)) {
          throw new ValidationError('Start date cannot be after end date');
        }
      }

      const budget = this.budgetRepository.create(budgetData);
      const savedBudget = await this.budgetRepository.save(budget);

      this.logger.log(
        `Created new budget: ${savedBudget.name} with status ${savedBudget.status}`
      );
      return savedBudget;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      this.logger.error(`Error creating budget: ${formatErrorMessage(error)}`);
      throw new DatabaseError(
        `Failed to create budget: ${formatErrorMessage(error)}`
      );
    }
  }

  /**
   * Update an existing budget
   */
  async update(id: string, budgetData: Partial<Budget>): Promise<Budget> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // First find the budget to ensure it exists
      const budget = await this.findById(id);

      // Validate status transitions
      if (budgetData.status && budget.status !== budgetData.status) {
        this.validateStatusTransition(budget, budgetData.status);
      }

      // If total amount is being updated, validate
      if (budgetData.totalAmount !== undefined) {
        const newAmount = new BigNumber(budgetData.totalAmount);
        const allocatedAmount = new BigNumber(budget.allocatedAmount);

        if (newAmount.isLessThan(allocatedAmount)) {
          throw new ValidationError(
            'Total budget amount cannot be less than already allocated amount'
          );
        }
      }

      // If dates are updated, validate
      if (budgetData.startDate || budgetData.endDate) {
        const startDate = budgetData.startDate
          ? new Date(budgetData.startDate)
          : budget.startDate;
        const endDate = budgetData.endDate
          ? new Date(budgetData.endDate)
          : budget.endDate;

        if (startDate && endDate && startDate > endDate) {
          throw new ValidationError('Start date cannot be after end date');
        }
      }

      // Update the budget
      Object.assign(budget, budgetData);

      const updatedBudget = await queryRunner.manager.save(budget);
      await queryRunner.commitTransaction();

      this.logger.log(
        `Updated budget: ${updatedBudget.name} with status ${updatedBudget.status}`
      );
      return updatedBudget;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundError ||
        error instanceof ValidationError ||
        error instanceof BusinessLogicError
      ) {
        throw error;
      }
      this.logger.error(
        `Error updating budget ${id}: ${formatErrorMessage(error)}`
      );
      throw new DatabaseError(
        `Failed to update budget: ${formatErrorMessage(error)}`
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Activate a budget that is in DRAFT status
   */
  async activateBudget(id: string): Promise<Budget> {
    return this.update(id, { status: BudgetStatus.ACTIVE });
  }

  /**
   * Close a budget
   */
  async closeBudget(id: string): Promise<Budget> {
    return this.update(id, { status: BudgetStatus.CLOSED });
  }

  /**
   * Update budget allocated amount
   */
  async updateAllocatedAmount(id: string, delta: string): Promise<Budget> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // First find the budget with lock
      const budget = await queryRunner.manager.findOne(Budget, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!budget) {
        throw new NotFoundError('Budget', id);
      }

      // Check if budget is active
      if (budget.status !== BudgetStatus.ACTIVE) {
        throw new BusinessLogicError(
          `Cannot update allocations for budget with status ${budget.status}`
        );
      }

      // Calculate new allocated amount
      const currentAllocated = new BigNumber(budget.allocatedAmount);
      const deltaAmount = new BigNumber(delta);
      const newAllocated = currentAllocated.plus(deltaAmount);

      // Validate allocated doesn't exceed total budget
      const totalBudget = new BigNumber(budget.totalAmount);
      if (newAllocated.isGreaterThan(totalBudget)) {
        throw new ValidationError(
          'Allocated amount cannot exceed total budget amount'
        );
      }

      if (newAllocated.isLessThan(0)) {
        throw new ValidationError('Allocated amount cannot be negative');
      }

      // Update the allocated amount
      budget.allocatedAmount = newAllocated.toString();

      const updatedBudget = await queryRunner.manager.save(budget);
      await queryRunner.commitTransaction();

      this.logger.log(
        `Updated allocated amount for budget ${id} to ${newAllocated.toString()}`
      );
      return updatedBudget;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundError ||
        error instanceof ValidationError ||
        error instanceof BusinessLogicError
      ) {
        throw error;
      }
      this.logger.error(
        `Error updating budget allocated amount ${id}: ${formatErrorMessage(error)}`
      );
      throw new DatabaseError(
        `Failed to update budget allocated amount: ${formatErrorMessage(error)}`
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Update budget spent amount
   */
  async updateSpentAmount(id: string, delta: string): Promise<Budget> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // First find the budget with lock
      const budget = await queryRunner.manager.findOne(Budget, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!budget) {
        throw new NotFoundError('Budget', id);
      }

      // Calculate new spent amount
      const currentSpent = new BigNumber(budget.spentAmount);
      const deltaAmount = new BigNumber(delta);
      const newSpent = currentSpent.plus(deltaAmount);

      // Validate spent doesn't exceed total budget
      const totalBudget = new BigNumber(budget.totalAmount);
      if (newSpent.isGreaterThan(totalBudget) && deltaAmount.isGreaterThan(0)) {
        throw new ValidationError(
          'Spent amount cannot exceed total budget amount'
        );
      }

      if (newSpent.isLessThan(0)) {
        throw new ValidationError('Spent amount cannot be negative');
      }

      // Update the spent amount
      budget.spentAmount = newSpent.toString();

      const updatedBudget = await queryRunner.manager.save(budget);
      await queryRunner.commitTransaction();

      this.logger.log(
        `Updated spent amount for budget ${id} to ${newSpent.toString()}`
      );
      return updatedBudget;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundError ||
        error instanceof ValidationError ||
        error instanceof BusinessLogicError
      ) {
        throw error;
      }
      this.logger.error(
        `Error updating budget spent amount ${id}: ${formatErrorMessage(error)}`
      );
      throw new DatabaseError(
        `Failed to update budget spent amount: ${formatErrorMessage(error)}`
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get available budget amount (total - allocated)
   */
  async getAvailableBudget(id: string): Promise<string> {
    try {
      const budget = await this.findById(id);

      const totalBudget = new BigNumber(budget.totalAmount);
      const allocatedBudget = new BigNumber(budget.allocatedAmount);

      const availableBudget = totalBudget.minus(allocatedBudget);
      return availableBudget.toString();
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      this.logger.error(
        `Error calculating available budget for ${id}: ${formatErrorMessage(error)}`
      );
      throw new DatabaseError(
        `Failed to calculate available budget: ${formatErrorMessage(error)}`
      );
    }
  }

  /**
   * Get remaining budget amount (total - spent)
   */
  async getRemainingBudget(id: string): Promise<string> {
    try {
      const budget = await this.findById(id);

      const totalBudget = new BigNumber(budget.totalAmount);
      const spentBudget = new BigNumber(budget.spentAmount);

      const remainingBudget = totalBudget.minus(spentBudget);
      return remainingBudget.toString();
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      this.logger.error(
        `Error calculating remaining budget for ${id}: ${formatErrorMessage(error)}`
      );
      throw new DatabaseError(
        `Failed to calculate remaining budget: ${formatErrorMessage(error)}`
      );
    }
  }

  /**
   * Check for and update expired budgets
   */
  async checkAndUpdateExpiredBudgets(): Promise<number> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const now = new Date();

      // Find active budgets that have passed their end date
      const expiredBudgets = await queryRunner.manager
        .createQueryBuilder(Budget, 'budget')
        .where('budget.status = :status', { status: BudgetStatus.ACTIVE })
        .andWhere('budget.endDate IS NOT NULL')
        .andWhere('budget.endDate < :now', { now })
        .getMany();

      for (const budget of expiredBudgets) {
        budget.status = BudgetStatus.EXPIRED;
        await queryRunner.manager.save(budget);
        this.logger.log(`Budget ${budget.id} marked as expired`);
      }

      await queryRunner.commitTransaction();

      this.logger.log(`Updated ${expiredBudgets.length} expired budgets`);
      return expiredBudgets.length;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error checking expired budgets: ${formatErrorMessage(error)}`
      );
      throw new DatabaseError(
        `Failed to check expired budgets: ${formatErrorMessage(error)}`
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Delete a budget (only allowed for DRAFT status)
   */
  async delete(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // First find the budget to ensure it exists
      const budget = await this.findById(id);

      // Only allow deletion of draft budgets
      if (budget.status !== BudgetStatus.DRAFT) {
        throw new BusinessLogicError(
          `Cannot delete budget with status ${budget.status}`
        );
      }

      // Check if budget has allocations
      if (budget.allocations && budget.allocations.length > 0) {
        throw new BusinessLogicError(
          'Cannot delete budget with existing allocations'
        );
      }

      await queryRunner.manager.remove(budget);
      await queryRunner.commitTransaction();

      this.logger.log(`Deleted budget: ${budget.name}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundError ||
        error instanceof BusinessLogicError
      ) {
        throw error;
      }
      this.logger.error(
        `Error deleting budget ${id}: ${formatErrorMessage(error)}`
      );
      throw new DatabaseError(
        `Failed to delete budget: ${formatErrorMessage(error)}`
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Validate status transitions for budgets
   */
  private validateStatusTransition(
    budget: Budget,
    newStatus: BudgetStatus
  ): void {
    const currentStatus = budget.status;

    // Define allowed transitions
    const allowedTransitions: Record<BudgetStatus, BudgetStatus[]> = {
      [BudgetStatus.DRAFT]: [BudgetStatus.ACTIVE, BudgetStatus.CLOSED],
      [BudgetStatus.ACTIVE]: [BudgetStatus.CLOSED, BudgetStatus.EXPIRED],
      [BudgetStatus.CLOSED]: [],
      [BudgetStatus.EXPIRED]: [BudgetStatus.CLOSED],
    };

    if (!allowedTransitions[currentStatus].includes(newStatus)) {
      throw new BusinessLogicError(
        `Invalid budget status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }
}
