import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  AssetTransaction,
  TransactionType,
  TransactionStatus,
} from '../entities/asset-transaction.entity';
import { TreasuryAssetService } from './treasury-asset.service';
import { LoggingService } from '../../../config/logging.service';
import {
  formatErrorMessage,
  NotFoundError,
  DatabaseError,
  ValidationError,
  BusinessLogicError,
} from '../../../shared/erros/app-error';
import BigNumber from 'bignumber.js';
import { StarknetService } from '../../blockchain/starknet.service';

@Injectable()
export class TreasuryTransactionService {
  constructor(
    @InjectRepository(AssetTransaction)
    private transactionRepository: Repository<AssetTransaction>,
    private assetService: TreasuryAssetService,
    @Inject(LoggingService)
    private logger: LoggingService,
    private dataSource: DataSource,
    private blockchainService: StarknetService
  ) {
    this.logger.setContext('TreasuryTransactionService');
    // Configure BigNumber for precision
    BigNumber.config({
      DECIMAL_PLACES: 18,
      ROUNDING_MODE: BigNumber.ROUND_DOWN,
    });
  }

  /**
   * Find all transactions with optional filtering
   */
  async findAll(
    assetId?: string,
    type?: TransactionType,
    status?: TransactionStatus,
    fromDate?: Date,
    toDate?: Date
  ): Promise<AssetTransaction[]> {
    try {
      const queryBuilder =
        this.transactionRepository.createQueryBuilder('transaction');

      if (assetId) {
        queryBuilder.andWhere('transaction.assetId = :assetId', { assetId });
      }

      if (type) {
        queryBuilder.andWhere('transaction.type = :type', { type });
      }

      if (status) {
        queryBuilder.andWhere('transaction.status = :status', { status });
      }

      if (fromDate) {
        queryBuilder.andWhere('transaction.createdAt >= :fromDate', {
          fromDate,
        });
      }

      if (toDate) {
        queryBuilder.andWhere('transaction.createdAt <= :toDate', { toDate });
      }

      queryBuilder.leftJoinAndSelect('transaction.asset', 'asset');
      queryBuilder.orderBy('transaction.createdAt', 'DESC');

      const transactions = await queryBuilder.getMany();
      this.logger.debug(`Retrieved ${transactions.length} transactions`);
      return transactions;
    } catch (error) {
      this.logger.error(
        `Error retrieving transactions: ${formatErrorMessage(error)}`
      );
      throw new DatabaseError(
        `Failed to retrieve transactions: ${formatErrorMessage(error)}`
      );
    }
  }

  /**
   * Find transaction by ID
   */
  async findById(id: string): Promise<AssetTransaction> {
    try {
      const transaction = await this.transactionRepository.findOne({
        where: { id },
        relations: ['asset'],
      });

      if (!transaction) {
        this.logger.warn(`Transaction with ID ${id} not found`);
        throw new NotFoundError('Transaction', id);
      }

      return transaction;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      this.logger.error(
        `Error finding transaction by ID ${id}: ${formatErrorMessage(error)}`
      );
      throw new DatabaseError(
        `Failed to find transaction: ${formatErrorMessage(error)}`
      );
    }
  }

  /**
   * Record a new deposit transaction
   */
  async recordDeposit(
    assetId: string,
    amount: string,
    fromAddress?: string,
    blockchainTxHash?: string,
    metadata?: Record<string, any>
  ): Promise<AssetTransaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate the amount
      const depositAmount = new BigNumber(amount);
      if (depositAmount.isNaN() || depositAmount.isLessThanOrEqualTo(0)) {
        throw new ValidationError('Deposit amount must be a positive number');
      }

      // Validate asset exists
      const asset = await this.assetService.findById(assetId);

      // Check blockchain transaction if provided
      if (blockchainTxHash) {
        try {
          await this.blockchainService.getTransaction(blockchainTxHash);
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : 'Unknown error';
          this.logger.warn(
            `Could not verify blockchain transaction ${blockchainTxHash}: ${errorMessage}`
          );
          // Continue with the transaction but mark as pending
        }
      }

      // Create the transaction record
      const transaction = this.transactionRepository.create({
        assetId,
        type: TransactionType.DEPOSIT,
        amount,
        fromAddress,
        blockchainTxHash,
        status: blockchainTxHash
          ? TransactionStatus.PENDING
          : TransactionStatus.CONFIRMED,
        metadata,
      });

      // If no blockchain transaction provided, update asset balance immediately
      if (!blockchainTxHash) {
        // Update the asset balance
        const currentBalance = new BigNumber(asset.balance);
        const newBalance = currentBalance.plus(depositAmount);
        asset.balance = newBalance.toString();
        await queryRunner.manager.save(asset);

        // Mark transaction as processed
        transaction.status = TransactionStatus.CONFIRMED;
        transaction.processedAt = new Date();
      }

      // Save the transaction
      const savedTransaction = await queryRunner.manager.save(transaction);

      // Commit the transaction
      await queryRunner.commitTransaction();

      this.logger.log(
        `Recorded deposit of ${amount} ${asset.symbol} with status ${savedTransaction.status}`
      );
      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      this.logger.error(
        `Error recording deposit: ${formatErrorMessage(error)}`
      );
      throw new DatabaseError(
        `Failed to record deposit: ${formatErrorMessage(error)}`
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Record a withdrawal transaction
   */
  async recordWithdrawal(
    assetId: string,
    amount: string,
    toAddress: string,
    blockchainTxHash?: string,
    metadata?: Record<string, any>
  ): Promise<AssetTransaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate the amount
      const withdrawalAmount = new BigNumber(amount);
      if (withdrawalAmount.isNaN() || withdrawalAmount.isLessThanOrEqualTo(0)) {
        throw new ValidationError(
          'Withdrawal amount must be a positive number'
        );
      }

      // Validate asset exists and has sufficient balance
      const asset = await queryRunner.manager.findOne(Asset, {
        where: { id: assetId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!asset) {
        throw new NotFoundError('Asset', assetId);
      }

      // Calculate available balance
      const totalBalance = new BigNumber(asset.balance);
      const allocatedBalance = new BigNumber(asset.allocatedBalance);
      const availableBalance = totalBalance.minus(allocatedBalance);

      // Check if there's enough available balance
      if (availableBalance.isLessThan(withdrawalAmount)) {
        throw new BusinessLogicError(
          `Insufficient available balance for withdrawal. Available: ${availableBalance.toString()}, Requested: ${withdrawalAmount.toString()}`
        );
      }

      // Create the transaction record
      const transaction = this.transactionRepository.create({
        assetId,
        type: TransactionType.WITHDRAWAL,
        amount,
        toAddress,
        blockchainTxHash,
        status: TransactionStatus.PENDING,
        metadata,
      });

      // Save the transaction
      const savedTransaction = await queryRunner.manager.save(transaction);

      // If no blockchain transaction is provided, process the withdrawal immediately
      if (!blockchainTxHash) {
        // Update the asset balance
        const newBalance = totalBalance.minus(withdrawalAmount);
        asset.balance = newBalance.toString();
        await queryRunner.manager.save(asset);

        // Mark transaction as processed
        transaction.status = TransactionStatus.CONFIRMED;
        transaction.processedAt = new Date();
        await queryRunner.manager.save(transaction);
      }

      // Commit the transaction
      await queryRunner.commitTransaction();

      this.logger.log(
        `Recorded withdrawal of ${amount} ${asset.symbol} to ${toAddress}`
      );
      return savedTransaction;
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
        `Error recording withdrawal: ${formatErrorMessage(error)}`
      );
      throw new DatabaseError(
        `Failed to record withdrawal: ${formatErrorMessage(error)}`
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Update transaction status, typically after confirming a blockchain transaction
   */
  async updateTransactionStatus(
    id: string,
    status: TransactionStatus,
    blockNumber?: string
  ): Promise<AssetTransaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the transaction
      const transaction = await queryRunner.manager.findOne(AssetTransaction, {
        where: { id },
        relations: ['asset'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!transaction) {
        throw new NotFoundError('Transaction', id);
      }

      // If transaction is already in the target status, return it
      if (transaction.status === status) {
        return transaction;
      }

      // Update the transaction status
      transaction.status = status;
      if (status === TransactionStatus.CONFIRMED) {
        transaction.processedAt = new Date();
        if (blockNumber) {
          transaction.blockNumber = blockNumber;
        }

        // If this is a deposit or withdrawal that's being confirmed, update the asset balance
        if (
          (transaction.type === TransactionType.DEPOSIT ||
            transaction.type === TransactionType.WITHDRAWAL) &&
          transaction.blockchainTxHash
        ) {
          const asset = transaction.asset;
          const amount = new BigNumber(transaction.amount);

          // Update asset balance based on transaction type
          const currentBalance = new BigNumber(asset.balance);
          let newBalance: BigNumber;

          if (transaction.type === TransactionType.DEPOSIT) {
            newBalance = currentBalance.plus(amount);
          } else {
            // WITHDRAWAL
            newBalance = currentBalance.minus(amount);
            if (newBalance.isLessThan(0)) {
              throw new BusinessLogicError(
                'Withdrawal would result in negative balance'
              );
            }
          }

          asset.balance = newBalance.toString();
          await queryRunner.manager.save(asset);
        }
      } else if (status === TransactionStatus.FAILED) {
        // If the transaction failed, we don't update the asset balance
        this.logger.warn(`Transaction ${id} marked as failed`);
      }

      // Save the updated transaction
      const updatedTransaction = await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      this.logger.log(`Updated status of transaction ${id} to ${status}`);
      return updatedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundError ||
        error instanceof BusinessLogicError
      ) {
        throw error;
      }
      this.logger.error(
        `Error updating transaction status ${id}: ${formatErrorMessage(error)}`
      );
      throw new DatabaseError(
        `Failed to update transaction status: ${formatErrorMessage(error)}`
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Process pending blockchain transactions
   * This could be run periodically to check the status of pending transactions
   */
  async processPendingTransactions(): Promise<number> {
    try {
      // Find all pending transactions with blockchain hash
      const pendingTransactions = await this.transactionRepository.find({
        where: {
          status: TransactionStatus.PENDING,
          blockchainTxHash: Not(IsNull()),
        },
        relations: ['asset'],
      });

      let processedCount = 0;

      for (const transaction of pendingTransactions) {
        try {
          // Skip if blockchainTxHash is undefined (shouldn't happen due to Not(IsNull()) above, but TypeScript needs this check)
          if (!transaction.blockchainTxHash) {
            this.logger.warn(
              `Transaction ${transaction.id} has no blockchainTxHash but was returned in query`
            );
            continue;
          }

          // Check the transaction status on the blockchain
          const txDetails = await this.blockchainService.getTransaction(
            transaction.blockchainTxHash
          );

          // Create a type-safe way to check properties on txDetails
          type TxDetails = Record<string, unknown>;
          const txData = txDetails as TxDetails;

          // Extract transaction status and block number with proper type checking
          if (
            txData &&
            typeof txData.status === 'string' &&
            txData.status === 'ACCEPTED_ON_L2'
          ) {
            // Extract the block number safely
            let blockNumber: string | null = null;
            if (
              txData.block_number !== undefined &&
              txData.block_number !== null
            ) {
              // Ensure proper string conversion
              if (typeof txData.block_number === 'number') {
                blockNumber = txData.block_number.toString();
              } else if (typeof txData.block_number === 'string') {
                blockNumber = txData.block_number;
              } else {
                // For other types, use JSON.stringify to get a safe representation
                blockNumber = JSON.stringify(txData.block_number);
              }
            }

            // Update the transaction status
            await this.updateTransactionStatus(
              transaction.id,
              TransactionStatus.CONFIRMED,
              blockNumber || undefined
            );

            processedCount++;
          } else if (
            txData &&
            typeof txData.status === 'string' &&
            txData.status === 'REJECTED'
          ) {
            // Transaction failed
            await this.updateTransactionStatus(
              transaction.id,
              TransactionStatus.FAILED
            );

            processedCount++;
          }
          // If still pending, do nothing
        } catch (error) {
          // Use proper error handling for the catch clause
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Unknown error processing transaction';

          this.logger.error(
            `Error processing pending transaction ${transaction.id}: ${errorMessage}`
          );
          // Continue with next transaction
        }
      }

      this.logger.log(
        `Processed ${processedCount} of ${pendingTransactions.length} pending transactions`
      );
      return processedCount;
    } catch (error) {
      this.logger.error(
        `Error processing pending transactions: ${formatErrorMessage(error)}`
      );
      throw new DatabaseError(
        `Failed to process pending transactions: ${formatErrorMessage(error)}`
      );
    }
  }

  /**
   * Calculate total transaction volume for a specific period
   */
  async calculateTransactionVolume(
    assetId?: string,
    fromDate?: Date,
    toDate?: Date
  ): Promise<{ deposits: string; withdrawals: string }> {
    try {
      // Default to current month if dates not provided
      const now = new Date();
      const startOfMonth =
        fromDate || new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth =
        toDate ||
        new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      // Query for confirmed transactions in the period
      const queryBuilder = this.transactionRepository
        .createQueryBuilder('transaction')
        .where('transaction.status = :status', {
          status: TransactionStatus.CONFIRMED,
        })
        .andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
          startDate: startOfMonth,
          endDate: endOfMonth,
        });

      if (assetId) {
        queryBuilder.andWhere('transaction.assetId = :assetId', { assetId });
      }

      // Get deposits
      // Explicitly type the query result
      interface QueryResult {
        total: string | null;
      }

      // Define explicit type for the raw query result
      type RawQueryResult = { total: string | null } | undefined;

      const depositsQuery: RawQueryResult = await queryBuilder
        .clone()
        .andWhere('transaction.type = :type', { type: TransactionType.DEPOSIT })
        .select('SUM(transaction.amount)', 'total')
        .getRawOne();

      // Create a safe object with the expected structure
      const deposits: QueryResult = {
        total: depositsQuery?.total ?? null,
      };

      // Get withdrawals
      const withdrawalsQuery: RawQueryResult = await queryBuilder
        .clone()
        .andWhere('transaction.type = :type', {
          type: TransactionType.WITHDRAWAL,
        })
        .select('SUM(transaction.amount)', 'total')
        .getRawOne();

      // Create a safe object with the expected structure
      const withdrawals: QueryResult = {
        total: withdrawalsQuery?.total ?? null,
      };

      // Handle null values safely
      const depositsTotal = deposits.total ?? '0';
      const withdrawalsTotal = withdrawals.total ?? '0';

      return {
        deposits: depositsTotal,
        withdrawals: withdrawalsTotal,
      };
    } catch (error) {
      this.logger.error(
        `Error calculating transaction volume: ${formatErrorMessage(error)}`
      );
      throw new DatabaseError(
        `Failed to calculate transaction volume: ${formatErrorMessage(error)}`
      );
    }
  }
}

// Import for Not and IsNull
import { Not, IsNull } from 'typeorm';
import { Asset } from '../entities/asset.entity';
