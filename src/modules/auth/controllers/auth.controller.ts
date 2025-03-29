import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { WalletLoginDto } from '../dto/wallet-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<{ token: string }> {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = this.authService.generateToken(user);
    return { token };
  }

  @HttpCode(HttpStatus.OK)
  @Post('wallet-login')
  async walletLogin(
    @Body() walletLoginDto: WalletLoginDto,
  ): Promise<{ token: string }> {
    const user = await this.authService.validateWallet(
      walletLoginDto.walletAddress,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid wallet address');
    }
    const token = this.authService.generateToken(user);
    return { token };
  }
}
