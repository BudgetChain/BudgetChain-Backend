import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { IsNotEmpty, IsString, IsNumber, Min, Max, Length } from 'class-validator';
  import { Treasury, ITreasury } from './treasury.entity';
  
  @Entity('risk_assessments')
  export class RiskAssessment {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    @IsNotEmpty()
    @IsString()
    treasuryId: string;
  
    @ManyToOne(() => Treasury, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'treasuryId' })
    treasury: Treasury;
  
    @Column()
    @IsNotEmpty()
    @IsString()
    @Length(1, 50)
    riskType: string;
  
    @Column()
    @IsNumber()
    @Min(0)
    @Max(100)
    score: number;
  
    @Column({ type: 'text' })
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