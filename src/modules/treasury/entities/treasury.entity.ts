import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Asset } from './asset.entity';
import { Transaction } from './transaction.entity';
import { Budget } from './budget.entity';
import { RiskAssessment } from './risk-assessment.entity';

@Entity('treasuries')
export class Treasury {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  organizationId: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  totalBalance: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  riskScore: number;

  @OneToMany(() => Asset, (asset) => asset.treasury)
  assets: Asset[];

  @OneToMany(() => Transaction, (transaction) => transaction.treasury)
  transactions: Transaction[];

  @OneToMany(() => Budget, (budget) => budget.treasury)
  budgets: Budget[];

  @OneToMany(() => RiskAssessment, (riskAssessment) => riskAssessment.treasury)
  riskAssessments: RiskAssessment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
