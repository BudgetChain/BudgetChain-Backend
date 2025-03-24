import { IsString, IsOptional, IsNumber, IsUUID, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTreasuryDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  organizationId: string;

  @IsOptional()
  @IsString()
  currency?: string;
}

export class UpdateTreasuryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  currency?: string;
}

export class TreasuryResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  organizationId: string;

  @IsNumber()
  totalBalance: number;

  @IsString()
  currency: string;

  @IsNumber()
  riskScore: number;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}