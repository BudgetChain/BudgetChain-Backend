import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../../user/user.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { LoginDto } from '../dto/login.dto';
import { WalletLoginDto } from '../dto/wallet-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async walletLogin(walletLoginDto: WalletLoginDto) {
    const user = await this.userService.findByWallet(walletLoginDto.publicAddress);
    if (!user) throw new UnauthorizedException('Wallet not registered');

    // Verify signature here (Starknet-specific logic)
    const isValid = await this.verifyStarknetSignature(
      walletLoginDto.publicAddress,
      walletLoginDto.signature,
    );
    if (!isValid) throw new UnauthorizedException('Invalid signature');

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  private async verifyStarknetSignature(
    publicAddress: string,
    signature: string,
  ): Promise<boolean> {
    // Implement actual Starknet verification
    return true; // Placeholder
  }
}