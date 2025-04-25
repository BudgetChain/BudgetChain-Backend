import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { Request } from 'express';

interface StarknetRequestBody {
  walletAddress?: string; // Optional wallet address
}

@Injectable()
export class StarknetStrategy extends PassportStrategy(Strategy, 'starknet') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(
    request: Request
  ): Promise<{ id: string; email: string; roles?: string[] }> {
    // Validate that request.body exists and is an object
    if (!request.body || typeof request.body !== 'object') {
      throw new UnauthorizedException('Invalid request body');
    }

    // Extract walletAddress with proper type-checking
    const { walletAddress } = request.body as StarknetRequestBody;
    if (!walletAddress) {
      throw new UnauthorizedException('Wallet address is required');
    }

    // Validate the wallet address using the AuthService
    const user = await this.authService.validateWallet(walletAddress);
    if (!user) {
      throw new UnauthorizedException('Invalid wallet address');
    }

    return user;
  }
}
