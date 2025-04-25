import { Repository } from 'typeorm';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '../../user/entities/transaction.entity';

export interface TransactionRepository extends Repository<Transaction> {
  findByTreasuryAndStatus(
    treasuryId: string,
    status: TransactionStatus
  ): Promise<Transaction[]>;
  findByType(treasuryId: string, type: TransactionType): Promise<Transaction[]>;
}
