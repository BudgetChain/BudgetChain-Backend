import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Treasury } from './treasury.entity';
import { Asset } from './asset.entity';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  SWAP = 'swap',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 24, scale: 8 })
  amount: number;

  @Column()
  treasuryId: string;

  @ManyToOne(() => Treasury, (treasury) => treasury.transactions)
  @JoinColumn({ name: 'treasuryId' })
  treasury: Treasury;

  @Column({ nullable: true })
  assetId: string;

  @ManyToOne(() => Asset, (asset) => asset.transactions, { nullable: true })
  @JoinColumn({ name: 'assetId' })
  asset: Asset;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ nullable: true })
  externalId: string;

  @Column({ nullable: true })
  sourceAddress: string;

  @Column({ nullable: true })
  destinationAddress: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;
}
