import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { IsNotEmpty, IsString, IsNumber, IsPositive, Length } from 'class-validator';
  import { Treasury, ITreasury } from './treasury.entity';
  
  @Entity('budgets')
  export class Budget {
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
    @Length(1, 100)
    name: string;
  
    @Column({ type: 'decimal', precision: 15, scale: 2 })
    @IsNumber()
    @IsPositive()
    amount: number;
  
    @Column()
    @IsNotEmpty()
    @IsString()
    @Length(1, 50)
    period: string;
  }
  
  export interface IBudget {
    id: string;
    treasuryId: string;
    treasury: ITreasury;
    name: string;
    amount: number;
    period: string;
  }