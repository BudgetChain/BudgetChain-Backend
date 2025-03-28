import { Injectable, CanActivate, ExecutionContext,ForbiddenException } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { ROLES_KEY } from '../decorators/roles.decorator';
  import { UserRole } from '../../modules/user/enums/user-role.enum';
  
  @Injectable()
  export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
  
    canActivate(context: ExecutionContext): boolean {
      const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
  
      // Public route if no roles specified
      if (!requiredRoles) return true;
  
      const { user } = context.switchToHttp().getRequest();
      
      // Check if user has required role
      const hasRole = requiredRoles.some(role => user?.roles?.includes(role));
      if (!hasRole) {
        throw new ForbiddenException(
          `Requires roles: ${requiredRoles.join(', ')}`
        );
      }
  
      return true;
    }
  }