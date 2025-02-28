import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtConfigService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  constructor(private readonly configService: ConfigService) {
    this.jwtSecret = this.configService.getOrThrow<string>('app.jwt.secret');
    this.jwtExpiresIn =
      this.configService.getOrThrow<string>('app.jwt.expiresIn');
  }

  get secret(): string {
    return this.jwtSecret;
  }

  get expiresIn(): string {
    return this.jwtExpiresIn;
  }

  // Optional: Method to generate signing options
  get signOptions(): any {
    return {
      secret: this.secret,
      expiresIn: this.expiresIn,
    };
  }
}
