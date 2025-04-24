import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { IsNotEmpty, IsString, IsNumber, IsDate, Min, Length } from 'class-validator';
  
  @Entity('treasuries')
  export class Treasury {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    @IsNotEmpty()
    @IsString()
    @Length(1, 100)
    name: string;
  
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    @IsNumber()
    @Min(0)
    totalBalance: number;
  
    @CreateDateColumn()
    @IsDate()
    createdAt: Date;
  
    @UpdateDateColumn()
    @IsDate()
    updatedAt: Date;
  }
  
  export interface ITreasury {
    id: string;
    name: string;
    totalBalance: number;
    createdAt: Date;
    updatedAt: Date;
  }