import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<{ id: string; email: string; roles?: string[] } | null> {
    const user = await this.userService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return null;
    }
    return { id: user.id, email: user.email, roles: user.roles };
  }

  async validateWallet(
    walletAddress: string,
  ): Promise<{ id: string; email: string; roles?: string[] } | null> {
    const user = await this.userService.findByWallet(walletAddress);
    if (!user) {
      return null;
    }
    return { id: user.id, email: user.email, roles: user.roles };
  }

  generateToken(user: Partial<JwtPayload>): string {
    // Validate that required fields are present
    if (!user.sub || !user.email) {
      throw new Error(
        'Missing required fields (sub or email) for token generation',
      );
    }

    const payload: JwtPayload = {
      sub: user.sub,
      email: user.email,
      roles: user.roles || [],
      wallet: user.wallet || undefined,
    };

    const secret = this.configService.get<string>('jwt.secret');
    const expiresIn = this.configService.get<string>('jwt.expiresIn');

    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    return jwt.sign(payload, secret, { expiresIn });
  }
}
