import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Treasury } from './treasury.entity';
import { Transaction } from './transaction.entity';

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  symbol: string;

  @Column()
  type: string;

  @Column({ type: 'decimal', precision: 24, scale: 8 })
  amount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  currentValue: number;

  @Column()
  treasuryId: string;

  @ManyToOne(() => Treasury, treasury => treasury.assets)
  @JoinColumn({ name: 'treasuryId' })
  treasury: Treasury;

  @OneToMany(() => Transaction, transaction => transaction.asset)
  transactions: Transaction[];

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @Column({ type: 'jsonb', default: '{}' })
  riskMetrics: Record<string, any>;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdated: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}