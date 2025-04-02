import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtConfigService } from '../../../config/jwt-config.service'; // Using custom JWT config
import { LoggingService } from '../../../config/logging.service';
import { User } from '../../user/entities/user.entity';
import { JwtPayload, TokenUser } from '../types/auth.types';
import { formatErrorMessage } from 'src/shared/erros/app-error';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly jwtConfig: JwtConfigService, // Injecting custom JWT config
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly logger: LoggingService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret, // Using configured secret key
    });
    this.logger.setContext('JwtStrategy');
  }

  async validate(payload: JwtPayload): Promise<TokenUser> {
    try {
      // Log extracted JWT payload
      this.logger.debug(`Validating JWT payload: ${JSON.stringify(payload)}`);

      // Fetch user from DB based on UUID from token
      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
        cache: true, // Added caching for better query performance
      });

      if (!user) {
        this.logger.warn(`User not found: ${payload.sub}`);
        throw new UnauthorizedException('User does not exist');
      }

      if (!user.isActive) {
        this.logger.warn(`Inactive user attempt: ${payload.sub}`);
        throw new UnauthorizedException('User account is inactive');
      }

      this.logger.debug(`User authenticated successfully: ${user.email}`);

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        provider: user.provider,
      };
    } catch (error) {
      const errorMsg = formatErrorMessage(error);
      this.logger.error(`JWT validation failed: ${errorMsg}`);
      throw new UnauthorizedException('Invalid authentication token');
    }
  }
}
