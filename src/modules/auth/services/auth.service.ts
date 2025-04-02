import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/modules/user/user.service';
import type { User, UserRole } from '../../user/entities/user.entity';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';

// Extend the UserService type with findByWallet
interface UserServiceWithWallet extends UserService {
  findByWallet(walletAddress: string): Promise<User | null>;
}

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<{ id: string; email: string; roles?: UserRole[] } | null> {
    const user: User | null = await this.userService.findByEmail(email);
    // Use "password" because your entity defines it that way.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return null;
    }
    // Convert singular role to an array.
    return { id: user.id, email: user.email, roles: [user.role] };
  }

  async validateWallet(
    walletAddress: string,
  ): Promise<{ id: string; email: string; roles?: UserRole[] } | null> {
    // Cast userService to the extended interface rather than to any.
    const userServiceWithWallet = this.userService as UserServiceWithWallet;
    const user: User | null =
      await userServiceWithWallet.findByWallet(walletAddress);
    if (!user) {
      return null;
    }
    return { id: user.id, email: user.email, roles: [user.role] };
  }

  generateToken(user: Partial<JwtPayload>): string {
    if (!user.sub || !user.email) {
      throw new Error(
        'Missing required fields (sub or email) for token generation',
      );
    }
    const payload: JwtPayload = {
      sub: user.sub,
      email: user.email,
      roles: user.roles || [],
      wallet: user.wallet,
    };

    const secret = this.configService.get<string>('jwt.secret');
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const expiresInRaw = this.configService.get<string>('jwt.expiresIn');
    if (!expiresInRaw) {
      throw new Error('JWT_EXPIRES_IN is not configured');
    }

    const expiresIn = Number(expiresInRaw);
    if (isNaN(expiresIn)) {
      throw new Error(
        `JWT_EXPIRES_IN must be a valid number, got "${expiresInRaw}"`,
      );
    }

    return jwt.sign(payload, secret, { expiresIn });
  }
}
