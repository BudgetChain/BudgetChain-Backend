import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { AssetTransaction } from './asset-transaction.entity';

export enum AssetType {
  CRYPTOCURRENCY = 'cryptocurrency',
  TOKEN = 'token',
  NFT = 'nft',
  FIAT = 'fiat',
}

@Entity('treasury_assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  symbol: string;

  @Column({
    type: 'enum',
    enum: AssetType,
    default: AssetType.CRYPTOCURRENCY,
  })
  type: AssetType;

  @Column({ nullable: true })
  contractAddress?: string;

  @Column({ nullable: true })
  chainId?: string;

  @Column({ type: 'decimal', precision: 36, scale: 18, default: 0 })
  balance: string;

  @Column({ type: 'decimal', precision: 36, scale: 18, default: 0 })
  allocatedBalance: string;

  @Column({ nullable: true })
  logoUrl?: string;

  @Column({ default: 18 })
  decimals: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true, type: 'json' })
  metadata?: Record<string, any>;

  @OneToMany(() => AssetTransaction, (transaction) => transaction.asset)
  transactions: AssetTransaction[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
