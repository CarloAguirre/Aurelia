import { Body, Controller, Get, Post } from '@nestjs/common';
import { MeResponse, Role } from '@aurelia/contracts';
import { AuthService, LoginRequest, LoginResponse } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('auth/login')
  login(@Body() payload: LoginRequest): Promise<LoginResponse> {
    return this.authService.login(payload);
  }

  @Get('me')
  getMe(): MeResponse {
    return {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'dev@aurelia.local',
      fullName: 'Aurelia Dev User',
      roles: [Role.ADMIN],
      permissions: ['*'],
      isPlaceholder: true,
    };
  }
}
