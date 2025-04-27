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
  Length,
} from 'class-validator';
import { Budget, IBudget } from './budget.entity';

@Entity('allocations')
@Index('idx_allocations_budgetId', ['budgetId'])
export class Allocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @IsNotEmpty()
  @IsString()
  budgetId: string;

  @ManyToOne(() => Budget, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'budgetId' })
  budget: Budget;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @Column({ type: 'varchar', length: 200 })
  @IsNotEmpty()
  @IsString()
  @Length(1, 200)
  purpose: string;
}

export interface IAllocation {
  id: string;
  budgetId: string;
  budget: IBudget;
  amount: number;
  purpose: string;
}
