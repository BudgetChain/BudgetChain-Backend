import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { LedgerEntry } from './ledger-entry.entity';

@Entity('transactions')
@Index(['date', 'category']) // Optimize search and filtering
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

  @Column()
  description: string;

  @Column()
  category: string; // e.g., 'income', 'expense', 'transfer'

  @ManyToOne(() => User)
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => LedgerEntry, ledgerEntry => ledgerEntry.transaction, {
    cascade: true,
  })
  ledgerEntries: LedgerEntry[];

  @Column({ default: false })
  reconciled: boolean;

  @Column({ type: 'json', nullable: true })
  metadata: any; // Flexible key-value pairs
}
