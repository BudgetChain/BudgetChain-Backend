import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsNumber,
  IsPositive,
  IsUUID,
  ValidateNested,
  IsArray,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateBudgetCategoryDto } from './create-budget-category.dto';
import { CreateBudgetMetricDto } from './create-budget-metric.dto';

export class CreateBudgetProposalDto {
  @IsUUID()
  @IsNotEmpty()
  treasuryId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  department: string;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsNumber()
  @IsPositive()
  requestedAmount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBudgetCategoryDto)
  categories: CreateBudgetCategoryDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBudgetMetricDto)
  metrics: CreateBudgetMetricDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  supportingDocuments?: string[];
}
