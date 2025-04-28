import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Repositories
import { TreasuryRepositoryImpl } from '../repository/treasury.repository';
import { AssetRepositoryImpl } from '../repository/asset.repository';
import { TransactionRepositoryImpl } from '../repository/transaction.repository';
import { BudgetRepositoryImpl } from '../repository/budget.repository';
import { AllocationRepositoryImpl } from '../repository/allocation.repository';
import { RiskAssessmentRepositoryImpl } from '../repository/rist_assessment.repository';
import { AuditLogRepositoryImpl } from '../repository/audit_log.repository';

import { ConfigModule } from '../../config/config.module';

// Entities
import { Asset } from './entities/asset.entity';
import { AssetTransaction } from './entities/asset-transaction.entity';
import { Budget } from './entities/budget.entity';
import { Allocation } from './entities/allocation.entity';
import { AllocationTransaction } from './entities/allocation-transaction.entity';
import { Treasury } from '../user/entities/treasury.entity';
import { Transaction } from '../user/entities/transaction.entity';
import { RiskAssessment } from '../user/entities/risk_assessment.entity';
import { AuditLog } from '../user/entities/audit_log.entity';

// Services
import { TreasuryService } from './services/treasury.service';
import { TreasuryAssetService } from './services/treasury-asset.service';
import { TreasuryTransactionService } from './services/treasury-transaction.service';
import { TreasuryBudgetService } from './services/treasury-budget.service';
import { TreasuryAllocationService } from './services/treasury-allocation.service';

// Controllers
import { TreasuryController } from './controllers/treasury.controller';
import { TreasuryAssetController } from './controllers/treasury-asset.controller';
import { TreasuryTransactionController } from './controllers/treasury-transaction.controller';
import { TreasuryBudgetController } from './controllers/treasury-budget.controller';
import { TreasuryAllocationController } from './controllers/treasury-allocation.controller';

// Blockchain module for blockchain interactions
import { BlockchainModule } from '../blockchain/blockchain.module';

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
  ],
  providers: [
    TreasuryService,
    TreasuryAssetService,
    TreasuryTransactionService,
    TreasuryBudgetService,
    TreasuryAllocationService,
    TreasuryRepositoryImpl,
    AssetRepositoryImpl,
    TransactionRepositoryImpl,
    BudgetRepositoryImpl,
    AllocationRepositoryImpl,
    RiskAssessmentRepositoryImpl,
    AuditLogRepositoryImpl,
  ],
  exports: [
    TreasuryService,
    TreasuryAssetService,
    TreasuryTransactionService,
    TreasuryBudgetService,
    TreasuryAllocationService,
    TreasuryRepositoryImpl,
    AssetRepositoryImpl,
    TransactionRepositoryImpl,
    BudgetRepositoryImpl,
    AllocationRepositoryImpl,
    RiskAssessmentRepositoryImpl,
    AuditLogRepositoryImpl,
  ],
})
export class TreasuryModule {}
