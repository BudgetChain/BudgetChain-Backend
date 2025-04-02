import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { LoginDto, RegisterDto, StarknetAuthDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { User } from '../user/entities/user.entity';
import { TokenResponse } from './types/auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<TokenResponse> {
    console.log('Login Request:', loginDto); // Debugging login input
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<TokenResponse> {
    console.log('Register Request:', registerDto); // Debugging registration input
    return this.authService.register(registerDto);
  }

  @Post('starknet')
  async starknetAuth(
    @Body() starknetAuthDto: StarknetAuthDto,
  ): Promise<TokenResponse> {
    console.log('Starknet Auth Request:', starknetAuthDto);
    return this.authService.authenticateWithStarknet(starknetAuthDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: User): Promise<User> {
    console.log('Authenticated User:', user); // Debugging user profile retrieval
    await Promise.resolve(); // Added dummy await to satisfy ESLint rule
    return user;
  }

  /** ✅ Added protected route */
  @UseGuards(JwtAuthGuard)
  @Get('protected-route')
  async getProtectedRoute(
    @CurrentUser() user: User,
  ): Promise<{ message: string; user: User }> {
    console.log('Protected Route Access:', user);

    // Simulating an asynchronous operation (e.g., fetching user data from DB)
    await Promise.resolve();

    return { message: 'You have access!', user };
  }
}
