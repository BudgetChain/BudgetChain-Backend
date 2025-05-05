import { IsOptional, IsString, IsNumber, IsPositive } from 'class-validator';

export class UpdateBudgetCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
