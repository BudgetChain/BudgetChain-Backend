import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Asset } from './asset.entity';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  ALLOCATION = 'allocation',
  DEALLOCATION = 'deallocation',
  TRANSFER = 'transfer',
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

@Entity('treasury_transactions')
export class AssetTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Asset, asset => asset.transactions)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @Column({ name: 'asset_id' })
  assetId: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  amount: string;

  @Column({ nullable: true })
  fromAddress?: string;

  @Column({ nullable: true })
  toAddress?: string;

  @Column({ nullable: true })
  blockchainTxHash?: string;

  @Column({ nullable: true })
  blockNumber?: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @Column({ nullable: true })
  reference?: string;

  @Column({ nullable: true })
  budgetId?: string;

  @Column({ nullable: true })
  allocationId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ nullable: true, name: 'processed_at' })
  processedAt?: Date;
}
