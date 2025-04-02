import { UserRole } from 'src/modules/user/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string | null;
  roles: UserRole[];
  wallet?: string;
  iat?: number;
  exp?: number;
}
