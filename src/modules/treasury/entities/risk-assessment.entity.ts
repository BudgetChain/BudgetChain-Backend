import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Treasury } from './treasury.entity';

@Entity('risk_assessments')
export class RiskAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  treasuryId: string;

  @ManyToOne(() => Treasury, (treasury) => treasury.riskAssessments)
  @JoinColumn({ name: 'treasuryId' })
  treasury: Treasury;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  overallScore: number;

  @Column({ type: 'jsonb' })
  marketRisk: {
    score: number;
    factors: Record<string, any>;
  };

  @Column({ type: 'jsonb' })
  counterpartyRisk: {
    score: number;
    assessment: Record<string, any>;
  };

  @Column({ type: 'jsonb' })
  liquidityRisk: {
    score: number;
    evaluation: Record<string, any>;
  };

  @Column({ type: 'jsonb' })
  volatilityMetrics: Record<string, any>;

  @Column({ type: 'jsonb' })
  recommendations: string[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
