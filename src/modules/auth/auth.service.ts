import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; // Provided by JwtModule
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, AuthProvider, UserRole } from '../user/entities/user.entity';
import { LoginDto, RegisterDto, StarknetAuthDto } from './dto/auth.dto';
import { StarknetService } from '../blockchain/starknet.service';
import { LoggingService } from '../../config/logging.service';
import {
  TokenResponse,
  UserWithoutPassword,
  JwtPayload,
  TokenUser,
} from './types/auth.types';
import {
  formatErrorMessage,
  AuthenticationError,
} from 'src/shared/erros/app-error';
import * as bcrypt from 'bcrypt'; // Proper ES6 import for bcrypt

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    @Inject(forwardRef(() => StarknetService))
    private starknetService: StarknetService,
    @Inject(forwardRef(() => LoggingService))
    private logger: LoggingService
  ) {
    if (!this.jwtService) {
      throw new Error('JwtService is not provided');
    }
    if (!this.starknetService) {
      throw new Error('StarknetService is not provided');
    }
    if (!this.logger) {
      throw new Error('LoggingService is not provided');
    }

    this.logger.setContext('AuthService');
    this.logger.log('All dependencies initialized successfully');
  }

  async validateUser(
    email: string,
    password: string
  ): Promise<UserWithoutPassword | null> {
    try {
      const user = await this.usersRepository.findOne({ where: { email } });

      if (user && user.password) {
        console.log('Plain Password from Request:', password);
        console.log('Stored Hashed Password:', user.password);

        try {
          const isPasswordValid = await this.comparePasswords(
            password,
            user.password
          );
          if (isPasswordValid) {
            // Remove password from the returned user object
            const { password: _password, ...result } = user;
            void _password; // Mark _password as used to silence ESLint
            return result;
          }
        } catch (compareError: unknown) {
          const errorMsg = formatErrorMessage(compareError);
          this.logger.error(`Error comparing passwords: ${errorMsg}`);
          throw new AuthenticationError(
            `Error comparing passwords: ${errorMsg}`
          );
        }
      }

      console.warn(`Failed login attempt for email: ${email}`);
      return null;
    } catch (error: unknown) {
      const errorMsg = formatErrorMessage(error);
      this.logger.error(`Error validating user: ${errorMsg}`);
      throw new AuthenticationError(`Error validating user: ${errorMsg}`);
    }
  }

  private async comparePasswords(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  private async hashPassword(
    password: string,
    saltRounds = 10
  ): Promise<string> {
    return bcrypt.hash(password, saltRounds);
  }

  async login(loginDto: LoginDto): Promise<TokenResponse> {
    try {
      const user = await this.validateUser(loginDto.email, loginDto.password);
      if (!user) {
        this.logger.warn(`Failed login attempt for email: ${loginDto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      this.logger.log(`User logged in: ${loginDto.email}`);
      return this.generateToken(user);
    } catch (error: unknown) {
      const errorMsg = formatErrorMessage(error);
      this.logger.error(`Login error: ${errorMsg}`);
      throw error;
    }
  }

  async register(registerDto: RegisterDto): Promise<TokenResponse> {
    try {
      const existingUser = await this.usersRepository.findOne({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        this.logger.warn(
          `Registration attempt with existing email: ${registerDto.email}`
        );
        throw new ConflictException('User with this email already exists');
      }

      try {
        const hashedPassword = await this.hashPassword(registerDto.password);
        const newUser = this.usersRepository.create({
          email: registerDto.email,
          password: hashedPassword,
          provider: AuthProvider.LOCAL,
          role: UserRole.USER,
        });

        const savedUser = await this.usersRepository.save(newUser);
        // Remove password from the returned user object
        const { password: _password, ...result } = savedUser;
        void _password; // Mark _password as used
        this.logger.log(`New user registered: ${registerDto.email}`);
        return this.generateToken(result);
      } catch (hashError: unknown) {
        const errorMsg = formatErrorMessage(hashError);
        this.logger.error(`Error hashing password: ${errorMsg}`);
        throw new AuthenticationError(`Error hashing password: ${errorMsg}`);
      }
    } catch (error: unknown) {
      const errorMsg = formatErrorMessage(error);
      this.logger.error(`Registration error: ${errorMsg}`);
      throw error;
    }
  }

  async authenticateWithStarknet(
    starknetAuthDto: StarknetAuthDto
  ): Promise<TokenResponse> {
    try {
      const isValidSignature = this.starknetService.verifySignature(
        starknetAuthDto.walletAddress,
        starknetAuthDto.signature,
        starknetAuthDto.message
      );

      if (!isValidSignature) {
        this.logger.warn(
          `Invalid Starknet signature for wallet: ${starknetAuthDto.walletAddress}`
        );
        throw new UnauthorizedException('Invalid Starknet signature');
      }

      let user = await this.usersRepository.findOne({
        where: { starknetWalletAddress: starknetAuthDto.walletAddress },
      });

      if (!user) {
        user = this.usersRepository.create({
          starknetWalletAddress: starknetAuthDto.walletAddress,
          provider: AuthProvider.STARKNET,
          role: UserRole.USER,
        });
        user = await this.usersRepository.save(user);
        this.logger.log(
          `New user created with Starknet wallet: ${starknetAuthDto.walletAddress}`
        );
      } else {
        this.logger.log(
          `User authenticated with Starknet wallet: ${starknetAuthDto.walletAddress}`
        );
      }

      return this.generateToken(user);
    } catch (error: unknown) {
      const errorMsg = formatErrorMessage(error);
      this.logger.error(`Starknet authentication error: ${errorMsg}`);
      throw error;
    }
  }

  private generateToken(user: UserWithoutPassword): TokenResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      provider: user.provider,
    };

    const tokenUser: TokenUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      provider: user.provider,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: tokenUser,
    };
  }
}
