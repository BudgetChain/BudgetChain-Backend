// modules/auth/strategies/starknet.strategy.ts
import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Injectable()
export class StarknetStrategy extends PassportStrategy(Strategy, 'starknet') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(request: Request): Promise<any> {
    const { publicAddress, signature } = request.body as any;
    
    // Verify the signature with Starknet
    const isValid = await this.verifyStarknetSignature(publicAddress, signature);
    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    return this.authService.walletLogin({ publicAddress, signature });
  }

  private async verifyStarknetSignature(publicAddress: string, signature: string): Promise<boolean> {
    // Implement actual Starknet verification logic
    return true; // Placeholder
  }
}