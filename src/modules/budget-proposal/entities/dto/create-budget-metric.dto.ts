import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBudgetMetricDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  value: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}
