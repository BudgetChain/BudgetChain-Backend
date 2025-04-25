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
import { Treasury, ITreasury } from './treasury.entity';

@Entity('assets')
@Index('idx_assets_treasuryId', ['treasuryId'])
export class Asset {
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
  @Length(1, 50)
  type: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  @IsNumber()
  @IsPositive()
  value: number;

  @Column({ type: 'varchar', length: 3 })
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
