import { IsString } from 'class-validator';

export class WalletLoginDto {
  @IsString()
  walletAddress: string;
}
