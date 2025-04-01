import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '../../user/entities/user.entity';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
