import { IsOptional, IsString } from 'class-validator';

export class UpdateBudgetMetricDto {
  @IsOptional()
  @IsString()
  name?: string;
  @IsOptional()
  @IsString()
  value?: string;
  @IsOptional()
  @IsString()
  description?: string;
}
