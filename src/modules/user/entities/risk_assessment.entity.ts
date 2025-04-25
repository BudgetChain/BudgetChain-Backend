import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { IsNotEmpty, IsString, IsNumber, Min, Max } from 'class-validator';
import { Treasury, ITreasury } from './treasury.entity';

@Entity('risk_assessments')
@Index('idx_risk_assessments_treasuryId', ['treasuryId'])
export class RiskAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @IsNotEmpty()
  @IsString()
  treasuryId: string;

  @ManyToOne(() => Treasury, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'treasuryId' })
  treasury: Treasury;

  @Column({ type: 'varchar', length: 50 })
  @IsNotEmpty()
  @IsString()
  riskType: string;

  @Column({ type: 'integer' })
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @Column({ type: 'text' })
  @IsNotEmpty()
  @IsString()
  description: string;
}

export interface IRiskAssessment {
  id: string;
  treasuryId: string;
  treasury: ITreasury;
  riskType: string;
  score: number;
  description: string;
}