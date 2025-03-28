import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Add custom logic here if needed (e.g., allow public routes)
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Customize error responses
    if (err || !user) {
      throw err || new Error('Invalid JWT');
    }
    return user;
  }
}