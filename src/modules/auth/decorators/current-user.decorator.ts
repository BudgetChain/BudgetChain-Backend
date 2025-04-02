import {
  createParamDecorator,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { TokenUser } from '../types/auth.types';

interface RequestWithUser extends Request {
  user?: TokenUser;
}

/**
 * Custom decorator to extract the current user from the request
 */
export const CurrentUser = createParamDecorator<TokenUser>(
  (data: unknown, ctx: ExecutionContext): TokenUser => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();

    // Validate user existence and structure
    if (!request.user || typeof request.user !== 'object' || !request.user.id) {
      throw new UnauthorizedException('User not found or invalid user data');
    }

    return request.user; // Type-safe user object
  },
);
