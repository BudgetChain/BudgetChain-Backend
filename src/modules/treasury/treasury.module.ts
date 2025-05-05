import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity'; // Updated path
import { LedgerEntry } from './entities/ledger-entry.entity'; // Added import
import { AuditLog } from './entities/audit-log.entity'; // Updated path
import { Account } from './entities/account.entity'; // Added import
import { TransactionService } from './services/transaction.service';
import { TransactionController } from './controllers/transaction.controller';
import { TreasuryService } from './services/treasury.service';
import { LoggingService } from 'src/config/logging.service';
import { TreasuryTransactionService } from './services/treasury-transaction.service';
import { TreasuryBudgetService } from './services/treasury-budget.service';
import { TreasuryAllocationService } from './services/treasury-allocation.service';
import { TreasuryAssetService } from './services/treasury-asset.service';
import { AssetTransaction } from './entities/asset-transaction.entity';
import { StarknetService } from '../blockchain/starknet.service';
import { Budget } from './entities/budget.entity';
import { Allocation } from './entities/allocation.entity';
import { AllocationTransaction } from './entities/allocation-transaction.entity';
import { Asset } from './entities/asset.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      LedgerEntry,
      AuditLog,
      Account,
      AssetTransaction,
      Budget,
      Allocation,
      AllocationTransaction,
      Asset,
    ]),
  ],
  providers: [
    TransactionService,
    TreasuryService,
    TreasuryTransactionService,
    TreasuryBudgetService,
    TreasuryAllocationService,
    TreasuryAssetService,
    LoggingService,
    StarknetService,
  ],
  controllers: [TransactionController],
  exports: [TreasuryService],
})
export class TreasuryModule {}
