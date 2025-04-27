import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Treasury } from '../user/entities/treasury.entity';
import { Asset } from '../user/entities/asset.entity';
import { Transaction } from '../user/entities/transaction.entity';
import { Budget } from '../user/entities/budget.entity';
import { Allocation } from '../user/entities/allocation.entity';
import { RiskAssessment } from '../user/entities/risk_assessment.entity';
import { AuditLog } from '../user/entities/audit_log.entity';
import { TreasuryRepositoryImpl } from '../repository/treasury.repository';
import { AssetRepositoryImpl } from '../repository/asset.repository';
import { TransactionRepositoryImpl } from '../repository/transaction.repository';
import { BudgetRepositoryImpl } from '../repository/budget.repository';
import { AllocationRepositoryImpl } from '../repository/allocation.repository';
import { RiskAssessmentRepositoryImpl } from '../repository/rist_assessment.repository';
import { AuditLogRepositoryImpl } from '../repository/audit_log.repository';
import { TransactionService } from './services/transaction.service';
import { TransactionController } from './controllers/transaction.controller';

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
  providers: [
    TreasuryRepositoryImpl,
    AssetRepositoryImpl,
    TransactionRepositoryImpl,
    BudgetRepositoryImpl,
    AllocationRepositoryImpl,
    RiskAssessmentRepositoryImpl,
    AuditLogRepositoryImpl,
    TransactionService,
  ],
  controllers: [TransactionController],
  exports: [
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
