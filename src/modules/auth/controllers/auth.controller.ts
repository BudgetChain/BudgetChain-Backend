import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LocalStrategy } from '../strategies/local.strategy';
import { StarknetStrategy } from '../strategies/starknet.strategy';
import { LoginDto } from '../dto/login.dto';
import { WalletLoginDto } from '../dto/wallet-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalStrategy)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(StarknetStrategy)
  @Post('wallet-login')
  async walletLogin(@Body() walletLoginDto: WalletLoginDto) {
    return this.authService.walletLogin(walletLoginDto);
  }
}