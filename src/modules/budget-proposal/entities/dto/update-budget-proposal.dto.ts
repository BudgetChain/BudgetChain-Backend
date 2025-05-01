import {
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
  IsPositive,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateBudgetCategoryDto } from './update-budget-category.dto';
import { UpdateBudgetMetricDto } from './update-budget-metric.dto';

export class UpdateBudgetProposalDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  requestedAmount?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateBudgetCategoryDto)
  categories?: UpdateBudgetCategoryDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateBudgetMetricDto)
  metrics?: UpdateBudgetMetricDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supportingDocuments?: string[];
}
