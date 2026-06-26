import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { MeResponse, Role } from '@aurelia/contracts';
import type { AuthenticatedRequest } from './authenticated-request';
import { AuthService, LoginRequest, LoginResponse } from './auth.service';
import { Public } from './public.decorator';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('auth/login')
  login(@Body() payload: LoginRequest): Promise<LoginResponse> {
    return this.authService.login(payload);
  }

  @Get('me')
  getMe(@Req() request: AuthenticatedRequest): MeResponse {
    return {
      id: request.user.sub,
      email: request.user.email,
      fullName: request.user.fullName,
      roles: request.user.roles as Role[],
      permissions: request.user.permissions,
      isPlaceholder: false,
    };
  }
}
