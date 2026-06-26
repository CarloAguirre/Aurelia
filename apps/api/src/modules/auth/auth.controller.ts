import { Body, Controller, Get, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { MeResponse, Role } from '@aurelia/contracts';
import type { AuthenticatedRequest } from './authenticated-request';
import { AuthService, LoginRequest, LoginResponse } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('auth/login')
  login(@Body() payload: LoginRequest): Promise<LoginResponse> {
    return this.authService.login(payload);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() request: AuthenticatedRequest): MeResponse {
    if (!request.user) {
      throw new UnauthorizedException('Unauthorized');
    }

    return {
      id: request.user.sub,
      email: request.user.email,
      fullName: request.user.email,
      roles: request.user.roles as Role[],
      permissions: request.user.permissions,
      isPlaceholder: false,
    };
  }
}
