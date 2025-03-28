import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class WalletLoginDto {
  @IsString()
  @IsNotEmpty()
  publicAddress: string;

  @IsString()
  @IsNotEmpty()
  signature: string;

 
}