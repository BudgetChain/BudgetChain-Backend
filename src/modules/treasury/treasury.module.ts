import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { LedgerEntry } from './entities/ledger-entry.entity';
import { AuditLog } from './entities/audit-log.entity';
import { Account } from './entities/account.entity';
import { TransactionService } from './services/transaction.service';
import { TransactionController } from './controllers/transaction.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, LedgerEntry, AuditLog, Account])],
  providers: [TransactionService],
  controllers: [TransactionController],
})
export class TreasuryModule {}