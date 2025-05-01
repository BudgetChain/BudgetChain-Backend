import { IsNotEmpty, IsString, IsNumber, IsPositive } from 'class-validator';

export class CreateBudgetCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNotEmpty()
  @IsString()
  description: string;
}
