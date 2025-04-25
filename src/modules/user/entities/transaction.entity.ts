import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsPositive,
  IsEnum,
  IsDate,
} from 'class-validator';
import { Treasury, ITreasury } from './treasury.entity';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER = 'TRANSFER',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('transactions')
@Index('idx_transactions_treasuryId', ['treasuryId'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @IsNotEmpty()
  @IsString()
  treasuryId: string;

  @ManyToOne(() => Treasury, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'treasuryId' })
  treasury: Treasury;

  @Column({ type: 'enum', enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @Column({ type: 'timestamp' })
  @IsDate()
  date: Date;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  @IsEnum(TransactionStatus)
  status: TransactionStatus;
}

export interface ITransaction {
  id: string;
  treasuryId: string;
  treasury: ITreasury;
  type: TransactionType;
  amount: number;
  date: Date;
  status: TransactionStatus;
}
