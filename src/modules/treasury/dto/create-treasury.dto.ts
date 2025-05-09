import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateTreasuryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @IsNumber()
  @IsNotEmpty()
  initialBalance: number;
}
