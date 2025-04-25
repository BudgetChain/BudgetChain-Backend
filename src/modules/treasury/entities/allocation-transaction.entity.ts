import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Allocation } from './allocation.entity';

export enum AllocationTransactionType {
  ALLOCATION = 'allocation',
  DISBURSEMENT = 'disbursement',
  REFUND = 'refund',
  CANCELLATION = 'cancellation',
}

@Entity('treasury_allocation_transactions')
export class AllocationTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Allocation, allocation => allocation.transactions)
  @JoinColumn({ name: 'allocation_id' })
  allocation: Allocation;

  @Column({ name: 'allocation_id' })
  allocationId: string;

  @Column({
    type: 'enum',
    enum: AllocationTransactionType,
  })
  type: AllocationTransactionType;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  amount: string;

  @Column({ nullable: true })
  blockchainTxHash?: string;

  @Column({ nullable: true })
  blockNumber?: string;

  @Column({ nullable: true })
  processedBy?: string;

  @Column({ nullable: true })
  reference?: string;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ nullable: true, name: 'processed_at' })
  processedAt?: Date;
}
