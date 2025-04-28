import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity'; // Updated path
import { LedgerEntry } from './entities/ledger-entry.entity'; // Added import
import { AuditLog } from './entities/audit-log.entity'; // Updated path
import { Account } from './entities/account.entity'; // Added import
import { TransactionService } from './services/transaction.service';
import { TransactionController } from './controllers/transaction.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Asset,
      AssetTransaction,
      Budget,
      Allocation,
      AllocationTransaction,
      Treasury,
      Transaction,
      RiskAssessment,
      AuditLog,
    ]),
    ConfigModule,
    BlockchainModule,
  ],
  controllers: [
    TreasuryController,
    TreasuryAssetController,
    TreasuryTransactionController,
    TreasuryBudgetController,
    TreasuryAllocationController,
    TransactionController,
  ],
  providers: [TransactionService],
  controllers: [TransactionController],
})
export class TreasuryModule {}
