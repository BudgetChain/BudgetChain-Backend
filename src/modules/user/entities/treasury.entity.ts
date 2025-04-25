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
import { RiskAssessment } from './risk_assessment.entity';

@Entity('treasuries')
export class Treasury {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalBalance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Asset, asset => asset.treasury)
  assets: Asset[];

  @OneToMany(() => Transaction, transaction => transaction.treasury)
  transactions: Transaction[];

  @OneToMany(() => Budget, budget => budget.treasury)
  budgets: Budget[];

  @OneToMany(() => RiskAssessment, riskAssessment => riskAssessment.treasury)
  riskAssessments: RiskAssessment[];
}

export interface ITreasury {
  id: string;
  name: string;
  totalBalance: number;
  createdAt: Date;
  updatedAt: Date;
  assets: Asset[];
  transactions: Transaction[];
  budgets: Budget[];
  riskAssessments: RiskAssessment[];
}
