import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateTreasuryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  balance?: number;
  initialBalance: undefined;
}
