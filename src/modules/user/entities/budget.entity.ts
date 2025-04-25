import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { IsNotEmpty, IsString, IsNumber, IsPositive, Length } from 'class-validator';
import { Treasury, ITreasury } from './treasury.entity';
import { Allocation } from './allocation.entity';

@Entity('budgets')
@Index('idx_budgets_treasuryId', ['treasuryId'])
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @IsNotEmpty()
  @IsString()
  treasuryId: string;

  @ManyToOne(() => Treasury, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'treasuryId' })
  treasury: Treasury;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  name: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @Column({ type: 'varchar', length: 50 })
  @IsNotEmpty()
  @IsString()
  @Length(1, 50)
  period: string;

  @OneToMany(() => Allocation, (allocation) => allocation.budget)
  allocations: Allocation[];
}

export interface IBudget {
  id: string;
  treasuryId: string;
  treasury: ITreasury;
  name: string;
  amount: number;
  period: string;
  allocations: Allocation[];
}