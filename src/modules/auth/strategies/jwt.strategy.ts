// import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
// import { PassportStrategy } from '@nestjs/passport';
// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { JwtPayload } from '../interfaces/jwt-payload.interface';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(private configService: ConfigService) {
//     const secret = this.validateSecret(configService.get<string>('jwt.secret'));

//     const options: StrategyOptions = {
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: secret,
//     };

//     super(options);
//   }

//   private validateSecret(secret: string | undefined): string {
//     if (!secret) {
//       throw new Error('JWT_SECRET is not configured');
//     }
//     return secret;
//   }

//   validate(payload: JwtPayload): JwtPayload {
//     return payload;
//   }
// }
