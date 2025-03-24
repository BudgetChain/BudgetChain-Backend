import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreasuryController } from './controllers/treasury.controller';
import { BudgetController } from './controllers/budget.controller';
import { AssetController } from './controllers/asset.controller';
import { TransactionController } from './controllers/transaction.controller';
import { RiskAssessmentController } from './controllers/risk-assessment.controller';
import { AllocationController } from './controllers/allocation.controller';
import { TreasuryService } from './services/treasury.service';
import { AssetService } from './services/asset.service';
import { TransactionService } from './services/transaction.service';
import { BudgetService } from './services/budget.service';
import { AllocationService } from './services/allocation.service';
import { RiskAssessmentService } from './services/risk-assessment.service';
import { AuditLogService } from './services/audit-log.service';
import { TreasuryRepository } from './repositories/treasury.repository';
import { AssetRepository } from './repositories/asset.repository';
import { TransactionRepository } from './repositories/transaction.repository';
import { BudgetRepository } from './repositories/budget.repository';
import { AllocationRepository } from './repositories/allocation.repository';
import { RiskAssessmentRepository } from './repositories/risk-assessment.repository';
import { AuditLogRepository } from './repositories/audit-log.repository';
import { Treasury } from './entities/treasury.entity';
import { Asset } from './entities/asset.entity';
import { Transaction } from './entities/transaction.entity';
import { Budget } from './entities/budget.entity';
import { Allocation } from './entities/allocation.entity';
import { RiskAssessment } from './entities/risk-assessment.entity';
import { AuditLog } from './entities/audit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Treasury,
      Asset,
      Transaction,
      Budget,
      Allocation,
      RiskAssessment,
      AuditLog,
    ]),
  ],
  controllers: [
    TreasuryController,
    BudgetController,
    AssetController,
    TransactionController,
    RiskAssessmentController,
    AllocationController,
  ],
  providers: [
    // Services
    TreasuryService,
    AssetService,
    TransactionService,
    BudgetService,
    AllocationService,
    RiskAssessmentService,
    AuditLogService,
    // Repositories
    TreasuryRepository,
    AssetRepository,
    TransactionRepository,
    BudgetRepository,
    AllocationRepository,
    RiskAssessmentRepository,
    AuditLogRepository,
  ],
  exports: [
    TreasuryService,
    AssetService,
    TransactionService,
    BudgetService,
    AllocationService,
    RiskAssessmentService,
    AuditLogService,
  ],
})
export class TreasuryModule {}