import { Injectable } from '@nestjs/common';
import { TransactionRepository } from '../repositories/transaction.repository';
import { AssetRepository } from '../repositories/asset.repository';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from '../entities/transaction.entity';
import { AuditLogService } from './audit-log.service';
import { EntityType, ActionType } from '../entities/audit-log.entity';

@Injectable()
export class TransactionService {
  constructor(
    private transactionRepository: TransactionRepository,
    private assetRepository: AssetRepository,
    private auditLogService: AuditLogService,
  ) {}

  async findAll(): Promise<Transaction[]> {
    return this.transactionRepository.findAll();
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.transactionRepository.findById(id);
  }

  async findByTreasuryId(treasuryId: string): Promise<Transaction[]> {
    return this.transactionRepository.findByTreasuryId(treasuryId);
  }

  async create(
    transaction: Partial<Transaction>,
    userId: string,
  ): Promise<Transaction> {
    const newTransaction = await this.transactionRepository.create(transaction);

    // If the transaction is already completed, update the asset
    if (
      newTransaction.status === TransactionStatus.COMPLETED &&
      newTransaction.assetId
    ) {
      await this.updateAssetOnTransaction(newTransaction);
    }

    // Log the creation action
    await this.auditLogService.logAction({
      treasuryId: newTransaction.treasuryId,
      entityType: EntityType.TRANSACTION,
      entityId: newTransaction.id,
      action: ActionType.CREATE,
      userId,
      previousState: null,
      newState: newTransaction,
    });

    return newTransaction;
  }

  async update(
    id: string,
    transaction: Partial<Transaction>,
    userId: string,
  ): Promise<Transaction | null> {
    const existingTransaction = await this.transactionRepository.findById(id);
    const updatedTransaction = await this.transactionRepository.update(
      id,
      transaction,
    );

    if (!existingTransaction || !updatedTransaction)
      throw new Error('existing/updated transaction not found');

    // If the status changed to completed, update the asset
    if (
      transaction.status === TransactionStatus.COMPLETED &&
      existingTransaction.status !== TransactionStatus.COMPLETED &&
      updatedTransaction.assetId
    ) {
      await this.updateAssetOnTransaction(updatedTransaction);

      // Set the completedAt timestamp
      await this.transactionRepository.update(id, { completedAt: new Date() });
    }

    // Log the update action
    await this.auditLogService.logAction({
      treasuryId: existingTransaction.treasuryId,
      entityType: EntityType.TRANSACTION,
      entityId: id,
      action: ActionType.UPDATE,
      userId,
      previousState: existingTransaction,
      newState: updatedTransaction,
    });

    return this.transactionRepository.findById(id);
  }

  async delete(id: string, userId: string): Promise<void> {
    const existingTransaction = await this.transactionRepository.findById(id);
    if (!existingTransaction) throw new Error('existing transaction not found');
    await this.transactionRepository.delete(id);

    // Log the delete action
    await this.auditLogService.logAction({
      treasuryId: existingTransaction.treasuryId,
      entityType: EntityType.TRANSACTION,
      entityId: id,
      action: ActionType.DELETE,
      userId,
      previousState: existingTransaction,
      newState: null,
    });
  }

  private async updateAssetOnTransaction(
    transaction: Transaction,
  ): Promise<void> {
    if (!transaction.assetId) return;

    const asset = await this.assetRepository.findById(transaction.assetId);
    if (!asset) throw new Error('asset not found');

    let newAmount = Number(asset.amount);

    // Update the asset amount based on transaction type
    switch (transaction.type) {
      case TransactionType.DEPOSIT:
        newAmount += Number(transaction.amount);
        break;
      case TransactionType.WITHDRAWAL:
        newAmount -= Number(transaction.amount);
        break;
      // Handle other transaction types as needed
    }

    // Update the asset
    await this.assetRepository.update(asset.id, {
      amount: newAmount,
      lastUpdated: new Date(),
    });
  }
}
