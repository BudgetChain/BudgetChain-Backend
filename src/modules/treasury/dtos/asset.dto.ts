import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsDate,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAssetDto {
  @IsString()
  name: string;

  @IsString()
  symbol: string;

  @IsString()
  type: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  currentValue: number;

  @IsString()
  treasuryId: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsObject()
  riskMetrics?: Record<string, any>;
}

export class UpdateAssetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  symbol?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsNumber()
  currentValue?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsObject()
  riskMetrics?: Record<string, any>;
}

export class AssetResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsString()
  symbol: string;

  @IsString()
  type: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  currentValue: number;

  @IsString()
  treasuryId: string;

  @IsObject()
  metadata: Record<string, any>;

  @IsObject()
  riskMetrics: Record<string, any>;

  @IsDate()
  @Type(() => Date)
  lastUpdated: Date;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}
