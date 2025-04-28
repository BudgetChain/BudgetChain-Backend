import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { LedgerEntry } from '../entities/ledger-entry.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { Account } from '../entities/account.entity';
import { User } from '../../user/entities/user.entity';

// Interface for metadata to replace `any`
interface Metadata {
  [key: string]: unknown;
}

// Interface for raw query results in generateReport
interface ReportRow {
  category: string;
  totalAmount: string; // Raw query returns string for numeric aggregates
}

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(LedgerEntry)
    private ledgerEntryRepository: Repository<LedgerEntry>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async createTransaction(
    user: User,
    date: Date,
    description: string,
    category: string,
    ledgerEntriesData: {
      accountId: number;
      type: 'debit' | 'credit';
      amount: number;
    }[],
    metadata?: Metadata,
  ): Promise<Transaction> {
    const debitTotal = ledgerEntriesData
      .filter((e) => e.type === 'debit')
      .reduce((sum, e) => sum + e.amount, 0);
    const creditTotal = ledgerEntriesData
      .filter((e) => e.type === 'credit')
      .reduce((sum, e) => sum + e.amount, 0);
    if (debitTotal !== creditTotal) {
      throw new Error('Debits must equal credits for double-entry bookkeeping');
    }

    const transaction = this.transactionRepository.create({
      date,
      description,
      category,
      createdBy: user,
      metadata,
      ledgerEntries: [],
    });

    for (const entryData of ledgerEntriesData) {
      const account = await this.accountRepository.findOneOrFail({
        where: { id: entryData.accountId },
      });
      const ledgerEntry = this.ledgerEntryRepository.create({
        account,
        type: entryData.type,
        amount: entryData.amount,
      });
      transaction.ledgerEntries.push(ledgerEntry);
    }

    const savedTransaction = await this.transactionRepository.save(transaction);
    await this.logAudit(user, 'Transaction', savedTransaction.id, 'create', {
      metadata,
    });
    return savedTransaction;
  }

  async updateTransaction(
    id: number,
    user: User,
    date?: Date,
    description?: string,
    category?: string,
    ledgerEntriesData?: {
      accountId: number;
      type: 'debit' | 'credit';
      amount: number;
    }[],
    metadata?: Metadata,
  ): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOneOrFail({
      where: { id },
      relations: ['ledgerEntries', 'ledgerEntries.account'],
    });
    const oldData = { ...transaction };

    if (date) transaction.date = date;
    if (description) transaction.description = description;
    if (category) transaction.category = category;
    if (metadata) transaction.metadata = metadata;

    if (ledgerEntriesData) {
      const debitTotal = ledgerEntriesData
        .filter((e) => e.type === 'debit')
        .reduce((sum, e) => sum + e.amount, 0);
      const creditTotal = ledgerEntriesData
        .filter((e) => e.type === 'credit')
        .reduce((sum, e) => sum + e.amount, 0);
      if (debitTotal !== creditTotal) {
        throw new Error(
          'Debits must equal credits for double-entry bookkeeping',
        );
      }

      await this.ledgerEntryRepository.remove(transaction.ledgerEntries);
      transaction.ledgerEntries = [];
      for (const entryData of ledgerEntriesData) {
        const account = await this.accountRepository.findOneOrFail({
          where: { id: entryData.accountId },
        });
        const ledgerEntry = this.ledgerEntryRepository.create({
          account,
          type: entryData.type,
          amount: entryData.amount,
        });
        transaction.ledgerEntries.push(ledgerEntry);
      }
    }

    const updatedTransaction =
      await this.transactionRepository.save(transaction);
    await this.logAudit(user, 'Transaction', id, 'update', {
      old: oldData,
      new: updatedTransaction,
    });
    return updatedTransaction;
  }

  async deleteTransaction(id: number, user: User): Promise<void> {
    const transaction = await this.transactionRepository.findOneOrFail({
      where: { id },
    });
    await this.transactionRepository.remove(transaction);
    await this.logAudit(user, 'Transaction', id, 'delete', {
      deleted: transaction,
    });
  }

  async findTransactions(
    filters: {
      startDate?: Date;
      endDate?: Date;
      category?: string;
      accountId?: number;
      description?: string;
    },
    page: number = 1,
    limit: number = 10,
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.ledgerEntries', 'ledgerEntry')
      .leftJoinAndSelect('ledgerEntry.account', 'account');

    if (filters.startDate || filters.endDate) {
      query.andWhere('transaction.date BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate || new Date(0),
        endDate: filters.endDate || new Date(),
      });
    }
    if (filters.category) {
      query.andWhere('transaction.category = :category', {
        category: filters.category,
      });
    }
    if (filters.accountId) {
      query.andWhere('ledgerEntry.accountId = :accountId', {
        accountId: filters.accountId,
      });
    }
    if (filters.description) {
      query.andWhere('transaction.description LIKE :description', {
        description: `%${filters.description}%`,
      });
    }

    const [transactions, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { transactions, total };
  }

  async reconcileTransactions(): Promise<void> {
    const accounts = await this.accountRepository.find();
    for (const account of accounts) {
      const ledgerEntries = await this.ledgerEntryRepository.find({
        where: { account: { id: account.id } },
        relations: ['transaction'],
      });
      const debitSum = ledgerEntries
        .filter((e) => e.type === 'debit')
        .reduce((sum, e) => sum + Number(e.amount), 0);
      const creditSum = ledgerEntries
        .filter((e) => e.type === 'credit')
        .reduce((sum, e) => sum + Number(e.amount), 0);
      const calculatedBalance = creditSum - debitSum;

      if (calculatedBalance !== Number(account.balance)) {
        const transactionIds = ledgerEntries.map((e) => e.transaction.id);
        await this.transactionRepository.update(
          { id: In(transactionIds) },
          { reconciled: false },
        );
        account.balance = calculatedBalance;
        await this.accountRepository.save(account); // Update balance per Issue #19 integration
      } else {
        const transactionIds = ledgerEntries.map((e) => e.transaction.id);
        await this.transactionRepository.update(
          { id: In(transactionIds) },
          { reconciled: true },
        );
      }
    }
  }

  async generateReport(
    startDate: Date,
    endDate: Date,
  ): Promise<{ category: string; totalAmount: number }[]> {
    const results = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('transaction.category', 'category')
      .addSelect(
        "SUM(CASE WHEN ledgerEntry.type = 'credit' THEN ledgerEntry.amount ELSE -ledgerEntry.amount END)",
        'totalAmount',
      )
      .leftJoin('transaction.ledgerEntries', 'ledgerEntry')
      .where('transaction.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('transaction.category')
      .getRawMany<ReportRow>();

    return results.map((row) => ({
      category: row.category,
      totalAmount: parseFloat(row.totalAmount),
    }));
  }

  private async logAudit(
    user: User,
    entityName: string,
    entityId: number,
    action: string,
    changes: Record<string, unknown>,
  ): Promise<void> {
    const auditLog = this.auditLogRepository.create({
      entityName,
      entityId,
      action,
      changes,
      user,
      timestamp: new Date(),
    } as AuditLog);
    await this.auditLogRepository.save(auditLog);
  }
}
