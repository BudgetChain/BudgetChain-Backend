import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsDate,
  IsEnum,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum BudgetStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

export class CreateBudgetDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  treasuryId: string;

  @IsNumber()
  totalAmount: number;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsOptional()
  @IsEnum(BudgetStatus)
  status?: BudgetStatus = BudgetStatus.DRAFT;

  @IsOptional()
  @IsArray()
  categories?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBudgetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsEnum(BudgetStatus)
  status?: BudgetStatus;

  @IsOptional()
  @IsArray()
  categories?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class BudgetResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  treasuryId: string;

  @IsNumber()
  totalAmount: number;

  @IsNumber()
  allocatedAmount: number;

  @IsNumber()
  spentAmount: number;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsEnum(BudgetStatus)
  status: BudgetStatus;

  @IsArray()
  categories: string[];

  @IsString()
  notes: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  submissionDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  approvalDate?: Date;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}
