import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Allocation, AllocationStatus } from '../entities/allocation.entity';
import { AllocationTransaction, AllocationTransactionType } from '../entities/allocation-transaction.entity';
import { TreasuryAssetService } from './treasury-asset.service';
import { TreasuryBudgetService } from './treasury-budget.service';
import { LoggingService } from '../../../config/logging.service';
import {
  formatErrorMessage,
  NotFoundError,
  DatabaseError,
  ValidationError,
  BusinessLogicError
} from '../../../shared/erros/app-error';
import BigNumber from 'bignumber.js';

@Injectable()
export class TreasuryAllocationService {
  constructor(
    @InjectRepository(Allocation)
    private allocationRepository: Repository<Allocation>,
    @InjectRepository(AllocationTransaction)
    private allocationTransactionRepository: Repository<AllocationTransaction>,
    private assetService: TreasuryAssetService,
    private budgetService: TreasuryBudgetService,
    @Inject(LoggingService)
    private logger: LoggingService,
    private dataSource: DataSource,
  ) {
    this.logger.setContext('TreasuryAllocationService');
    // Configure BigNumber for precision
    BigNumber.config({
      DECIMAL_PLACES: 18,
      ROUNDING_MODE: BigNumber.ROUND_DOWN
    });
  }

  /**
   * Find all allocations with optional filtering
   */
  async findAll(
    budgetId?: string,
    assetId?: string,
    status?: AllocationStatus,
    recipientId?: string,
  ): Promise<Allocation[]> {
    try {
      const queryBuilder = this.allocationRepository.createQueryBuilder('allocation');

      if (budgetId) {
        queryBuilder.andWhere('allocation.budgetId = :budgetId', { budgetId });
      }

      if (assetId) {
        queryBuilder.andWhere('allocation.assetId = :assetId', { assetId });
      }

      if (status) {
        queryBuilder.andWhere('allocation.status = :status', { status });
      }

      if (recipientId) {
        queryBuilder.andWhere('allocation.recipientId = :recipientId', { recipientId });
      }

      queryBuilder.leftJoinAndSelect('allocation.budget', 'budget');
      queryBuilder.leftJoinAndSelect('allocation.asset', 'asset');
      queryBuilder.leftJoinAndSelect('allocation.transactions', 'transactions');
      queryBuilder.orderBy('allocation.createdAt', 'DESC');

      const allocations = await queryBuilder.getMany();
      this.logger.debug(`Retrieved ${allocations.length} allocations`);
      return allocations;
    } catch (error) {
      this.logger.error(`Error retrieving allocations: ${formatErrorMessage(error)}`);
      throw new DatabaseError(`Failed to retrieve allocations: ${formatErrorMessage(error)}`);
    }
  }

  /**
   * Find allocation by ID
   */
  async findById(id: string): Promise<Allocation> {
    try {
      const allocation = await this.allocationRepository.findOne({
        where: { id },
        relations: ['budget', 'asset', 'transactions'],
      });

      if (!allocation) {
        this.logger.warn(`Allocation with ID ${id} not found`);
        throw new NotFoundError('Allocation', id);
      }

      return allocation;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      this.logger.error(
        `Error finding allocation by ID ${id}: ${formatErrorMessage(error)}`,
      );
      throw new DatabaseError(
        `Failed to find allocation: ${formatErrorMessage(error)}`,
      );
    }
  }

  /**
   * Create a new allocation
   */
  async create(allocationData: Partial<Allocation>): Promise<Allocation> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate required fields
      if (!allocationData.title) {
        throw new ValidationError('Allocation title is required');
      }

      if (!allocationData.budgetId) {
        throw new ValidationError('Budget ID is required');
      }

      if (!allocationData.assetId) {
        throw new ValidationError('Asset ID is required');
      }

      if (!allocationData.amount) {
        throw new ValidationError('Allocation amount is required');
      }

      // Validate amount
      const amount = new BigNumber(allocationData.amount);
      if (amount.isNaN() || amount.isLessThanOrEqualTo(0)) {
        throw new ValidationError('Allocation amount must be a positive number');
      }

      // Verify budget exists and has sufficient available funds
      const budget = await this.budgetService.findById(allocationData.budgetId);
      const availableBudget = await this.budgetService.getAvailableBudget(allocationData.budgetId);

      if (new BigNumber(availableBudget).isLessThan(amount)) {
        throw new BusinessLogicError(`Insufficient available budget. Available: ${availableBudget}, Requested: ${amount.toString()}`);
      }

      // Verify asset exists
      const asset = await this.assetService.findById(allocationData.assetId);
      const availableAssetBalance = await this.assetService.getAvailableBalance(allocationData.assetId);

      if (new BigNumber(availableAssetBalance).isLessThan(amount)) {
        throw new BusinessLogicError(`Insufficient available asset balance. Available: ${availableAssetBalance}, Requested: ${amount.toString()}`);
      }

      // Set default values
      allocationData.status = allocationData.status || AllocationStatus.PENDING;
      allocationData.spentAmount = '0';

      // Create and save the allocation
      const allocation = this.allocationRepository.create(allocationData);
      const savedAllocation = await queryRunner.manager.save(allocation);

      // Update budget allocated amount if approved
      if (savedAllocation.status === AllocationStatus.APPROVED) {
        await this.budgetService.updateAllocatedAmount(savedAllocation.budgetId, savedAllocation.amount);

        // Update asset allocated balance
        await this.assetService.updateAllocatedBalance(savedAllocation.assetId, savedAllocation.amount);

        // Record allocation transaction
        await this.recordAllocationTransaction(
          queryRunner,
          savedAllocation.id,
          AllocationTransactionType.ALLOCATION,
          savedAllocation.amount
        );
      }

      await queryRunner.commitTransaction();

      this.logger.log(`Created new allocation: ${savedAllocation.title} with status ${savedAllocation.status}`);
      return savedAllocation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundError ||
        error instanceof ValidationError ||
        error instanceof BusinessLogicError
      ) {
        throw error;
      }
      this.logger.error(`Error creating allocation: ${formatErrorMessage(error)}`);
      throw new DatabaseError(`Failed to create allocation: ${formatErrorMessage(error)}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Update an existing allocation
   */
  async update(id: string, allocationData: Partial<Allocation>): Promise<Allocation> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // First find the allocation to ensure it exists
      const allocation = await this.findById(id);

      // Check if status is being changed
      if (allocationData.status !== undefined && allocation.status !== allocationData.status) {
        await this.validateStatusTransition(allocation, allocationData.status);

        // Handle status change
        if (allocationData.status === AllocationStatus.APPROVED && allocation.status === AllocationStatus.PENDING) {
          // Allocate funds
          await this.budgetService.updateAllocatedAmount(allocation.budgetId, allocation.amount);
          await this.assetService.updateAllocatedBalance(allocation.assetId, allocation.amount);

          // Record allocation transaction
          await this.recordAllocationTransaction(
            queryRunner,
            allocation.id,
            AllocationTransactionType.ALLOCATION,
            allocation.amount,
            allocationData.approvedBy
          );

          allocation.approvedAt = new Date();
          allocation.approvedBy = allocationData.approvedBy;
        }
        else if (allocationData.status === AllocationStatus.REJECTED && allocation.status === AllocationStatus.PENDING) {
          // No funds were allocated, just update status
        }
        else if (allocationData.status === AllocationStatus.CANCELLED &&
                (allocation.status === AllocationStatus.APPROVED || allocation.status === AllocationStatus.PENDING)) {
          if (allocation.status === AllocationStatus.APPROVED) {
            // Release allocated funds
            const amountToRelease = new BigNumber(allocation.amount).minus(allocation.spentAmount).toString();

            if (new BigNumber(amountToRelease).isGreaterThan(0)) {
              await this.budgetService.updateAllocatedAmount(allocation.budgetId, `-${amountToRelease}`);
              await this.assetService.updateAllocatedBalance(allocation.assetId, `-${amountToRelease}`);

              // Record cancellation transaction
              await this.recordAllocationTransaction(
                queryRunner,
                allocation.id,
                AllocationTransactionType.CANCELLATION,
                amountToRelease
              );
            }
          }
        }
        else if (allocationData.status === AllocationStatus.COMPLETED && allocation.status === AllocationStatus.APPROVED) {
          // Check if all funds are spent
          const allocatedAmount = new BigNumber(allocation.amount);
          const spentAmount = new BigNumber(allocation.spentAmount);

          if (allocatedAmount.isGreaterThan(spentAmount)) {
            // Return unspent funds
            const amountToReturn = allocatedAmount.minus(spentAmount).toString();

            await this.budgetService.updateAllocatedAmount(allocation.budgetId, `-${amountToReturn}`);
            await this.assetService.updateAllocatedBalance(allocation.assetId, `-${amountToReturn}`);

            // Record refund transaction
            await this.recordAllocationTransaction(
              queryRunner,
              allocation.id,
              AllocationTransactionType.REFUND,
              amountToReturn
            );
          }
        }
      }

      // Update the allocation
      Object.assign(allocation, allocationData);

      const updatedAllocation = await queryRunner.manager.save(allocation);
      await queryRunner.commitTransaction();

      this.logger.log(`Updated allocation: ${updatedAllocation.title} with status ${updatedAllocation.status}`);
      return updatedAllocation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundError ||
        error instanceof ValidationError ||
        error instanceof BusinessLogicError
      ) {
        throw error;
      }
      this.logger.error(`Error updating allocation ${id}: ${formatErrorMessage(error)}`);
      throw new DatabaseError(`Failed to update allocation: ${formatErrorMessage(error)}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Approve an allocation
   */
  async approveAllocation(id: string, approvedBy?: string): Promise<Allocation> {
    return this.update(id, {
      status: AllocationStatus.APPROVED,
      approvedBy,
    });
  }

  /**
   * Reject an allocation
   */
  async rejectAllocation(id: string, rejectedBy?: string): Promise<Allocation> {
    return this.update(id, {
      status: AllocationStatus.REJECTED,
      approvedBy: rejectedBy, // reuse approvedBy field to track who rejected
    });
  }

  /**
   * Cancel an allocation
   */
  async cancelAllocation(id: string): Promise<Allocation> {
    return this.update(id, { status: AllocationStatus.CANCELLED });
  }

  /**
   * Complete an allocation
   */
  async completeAllocation(id: string): Promise<Allocation> {
    return this.update(id, { status: AllocationStatus.COMPLETED });
  }

  /**
   * Process a disbursement from an allocation
   */
  async processDisbursement(
    id: string,
    amount: string,
    blockchainTxHash?: string,
    reference?: string,
    metadata?: Record<string, any>,
  ): Promise<Allocation> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find allocation with lock
      const allocation = await queryRunner.manager.findOne(Allocation, {
        where: { id },
        relations: ['budget', 'asset'],
        lock: { mode: 'pessimistic_write' }
      });

      if (!allocation) {
        throw new NotFoundError('Allocation', id);
      }

      // Validate allocation status
      if (allocation.status !== AllocationStatus.APPROVED) {
        throw new BusinessLogicError(`Cannot disburse from allocation with status ${allocation.status}`);
      }

      // Validate amount
      const disbursementAmount = new BigNumber(amount);
      if (disbursementAmount.isNaN() || disbursementAmount.isLessThanOrEqualTo(0)) {
        throw new ValidationError('Disbursement amount must be a positive number');
      }

      // Check if there's enough remaining in the allocation
      const allocatedAmount = new BigNumber(allocation.amount);
      const spentAmount = new BigNumber(allocation.spentAmount);
      const remainingAmount = allocatedAmount.minus(spentAmount);

      if (remainingAmount.isLessThan(disbursementAmount)) {
        throw new BusinessLogicError(
          `Insufficient remaining allocation. Remaining: ${remainingAmount.toString()}, Requested: ${disbursementAmount.toString()}`
        );
      }

      // Record allocation transaction
      await this.recordAllocationTransaction(
        queryRunner,
        allocation.id,
        AllocationTransactionType.DISBURSEMENT,
        amount,
        "",
        blockchainTxHash,
        reference,
        metadata
      );

      // Update spent amount
      const newSpentAmount = spentAmount.plus(disbursementAmount);
      allocation.spentAmount = newSpentAmount.toString();

      // Update budget spent amount
      await this.budgetService.updateSpentAmount(allocation.budgetId, amount);

      // If all funds used, mark as completed
      if (newSpentAmount.isEqualTo(allocatedAmount)) {
        allocation.status = AllocationStatus.COMPLETED;
      }

      // Save the updated allocation
      const updatedAllocation = await queryRunner.manager.save(allocation);
      await queryRunner.commitTransaction();

      this.logger.log(
        `Processed disbursement of ${amount} from allocation ${id}, new spent amount: ${updatedAllocation.spentAmount}`
      );
      return updatedAllocation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundError ||
        error instanceof ValidationError ||
        error instanceof BusinessLogicError
      ) {
        throw error;
      }
      this.logger.error(`Error processing disbursement for allocation ${id}: ${formatErrorMessage(error)}`);
      throw new DatabaseError(`Failed to process disbursement: ${formatErrorMessage(error)}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get allocation transactions
   */
  async getAllocationTransactions(allocationId: string): Promise<AllocationTransaction[]> {
    try {
      const transactions = await this.allocationTransactionRepository.find({
        where: { allocationId },
        order: { createdAt: 'DESC' }
      });

      this.logger.debug(`Retrieved ${transactions.length} transactions for allocation ${allocationId}`);
      return transactions;
    } catch (error) {
      this.logger.error(
        `Error retrieving transactions for allocation ${allocationId}: ${formatErrorMessage(error)}`
      );
      throw new DatabaseError(
        `Failed to retrieve allocation transactions: ${formatErrorMessage(error)}`
      );
    }
  }

  /**
   * Delete an allocation (only allowed for PENDING status)
   */
  async delete(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // First find the allocation to ensure it exists
      const allocation = await this.findById(id);

      // Only allow deletion of pending allocations
      if (allocation.status !== AllocationStatus.PENDING) {
        throw new BusinessLogicError(`Cannot delete allocation with status ${allocation.status}`);
      }

      // Delete associated transactions
      if (allocation.transactions && allocation.transactions.length > 0) {
        await queryRunner.manager.remove(allocation.transactions);
      }

      await queryRunner.manager.remove(allocation);
      await queryRunner.commitTransaction();

      this.logger.log(`Deleted allocation: ${allocation.title}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundError || error instanceof BusinessLogicError) {
        throw error;
      }
      this.logger.error(`Error deleting allocation ${id}: ${formatErrorMessage(error)}`);
      throw new DatabaseError(`Failed to delete allocation: ${formatErrorMessage(error)}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Record an allocation transaction
   */
  private async recordAllocationTransaction(
    queryRunner: any,
    allocationId: string,
    type: AllocationTransactionType,
    amount: string,
    processedBy?: string,
    blockchainTxHash?: string,
    reference?: string,
    metadata?: Record<string, any>,
  ): Promise<AllocationTransaction> {
    const transaction = this.allocationTransactionRepository.create({
      allocationId,
      type,
      amount,
      processedBy,
      blockchainTxHash,
      reference,
      metadata,
      processedAt: new Date(),
    });

    const savedTransaction = await queryRunner.manager.save(transaction);
    this.logger.debug(
      `Recorded allocation transaction of type ${type} and amount ${amount} for allocation ${allocationId}`
    );
    return savedTransaction;
  }

  /**
   * Validate status transitions for allocations
   */
  private async validateStatusTransition(allocation: Allocation, newStatus: AllocationStatus): Promise<void> {
    const currentStatus = allocation.status;

    // Define allowed transitions
    const allowedTransitions: Record<AllocationStatus, AllocationStatus[]> = {
      [AllocationStatus.PENDING]: [AllocationStatus.APPROVED, AllocationStatus.REJECTED, AllocationStatus.CANCELLED],
      [AllocationStatus.APPROVED]: [AllocationStatus.COMPLETED, AllocationStatus.CANCELLED],
      [AllocationStatus.REJECTED]: [],
      [AllocationStatus.COMPLETED]: [],
      [AllocationStatus.CANCELLED]: [],
    };

    if (!allowedTransitions[currentStatus].includes(newStatus)) {
      throw new BusinessLogicError(
        `Invalid allocation status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}
