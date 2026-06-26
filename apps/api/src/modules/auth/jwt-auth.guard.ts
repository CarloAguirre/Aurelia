import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { JwtTokenService } from './jwt-token.service';

const PUBLIC_PATHS = new Set([
  '/api/auth/login',
  '/api/health',
]);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: unknown }>();
    if (this.isPublicRequest(request)) return true;
    const token = this.extractBearerToken(request);
    request.user = this.jwtTokenService.verify(token);
    return true;
  }

  private isPublicRequest(request: Request): boolean {
    const path = request.path || request.url;
    return PUBLIC_PATHS.has(path) || path.startsWith('/api/health/');
  }

  private extractBearerToken(request: Request): string {
    const header = request.headers.authorization;
    if (!header) throw new UnauthorizedException('Missing authorization header');
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) throw new UnauthorizedException('Invalid authorization header');
    return token;
  }
}
