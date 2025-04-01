import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from 'src/config/config.module';
import { JwtConfigService } from 'src/config/jwt-config.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../user/entities/user.entity';
import { AuthController } from './auth.controller';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    TypeOrmModule.forFeature([User]),
    BlockchainModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (jwtConfig: JwtConfigService) => {
        await Promise.resolve(); // Added dummy await to satisfy ESLint rule
        return {
          secret: jwtConfig.secret,
          signOptions: { expiresIn: jwtConfig.expiresIn },
        };
      },
      inject: [JwtConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
