import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { IsNotEmpty, IsString, IsNumber, IsPositive, Length } from 'class-validator';
  import { Treasury, ITreasury } from './treasury.entity';
  
  @Entity('assets')
  export class Asset {
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
    type: string;
  
    @Column({ type: 'decimal', precision: 15, scale: 2 })
    @IsNumber()
    @IsPositive()
    value: number;
  
    @Column()
    @IsNotEmpty()
    @IsString()
    @Length(3, 3)
    currency: string;
  }
  
  export interface IAsset {
    id: string;
    treasuryId: string;
    treasury: ITreasury;
    type: string;
    value: number;
    currency: string;
  }