import type {
  User,
  UserRole,
  AuthProvider,
} from '../../user/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string | null;
  role: UserRole;
  provider: AuthProvider;
  iat?: number;
  exp?: number;
}

/**
 * User data returned in token responses
 */
export interface TokenUser {
  id: string;
  email: string | null;
  role: UserRole;
  provider: AuthProvider;
}

/**
 * Token response structure
 */
export interface TokenResponse {
  access_token: string;
  user: TokenUser;
}

/**
 * Request with authenticated user
 */
export interface RequestWithUser extends Request {
  user: TokenUser;
}

/**
 * User data without password
 */

// Define interfaces for token-related data
export interface TokenUser {
  id: string;
  email: string | null;
  role: UserRole;
  provider: AuthProvider;
}

export interface TokenResponse {
  access_token: string;
  user: TokenUser;
}

export interface JwtPayload {
  sub: string;
  email: string | null;
  role: UserRole;
  provider: AuthProvider;
}

export type UserWithoutPassword = Omit<User, 'password' | 'hashPassword'>;
