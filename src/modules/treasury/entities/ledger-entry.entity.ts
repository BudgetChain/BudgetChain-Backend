import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Transaction } from './transaction.entity';
import { Account } from './account.entity';

@Entity('ledger_entries')
export class LedgerEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Transaction, (transaction) => transaction.ledgerEntries)
  transaction: Transaction;

  @ManyToOne(() => Account)
  account: Account;

  @Column({ type: 'enum', enum: ['debit', 'credit'] })
  type: 'debit' | 'credit';

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;
}
