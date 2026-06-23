import { Controller, Get } from '@nestjs/common';
import { MeResponse, Role } from '@aurelia/contracts';

@Controller('me')
export class AuthController {
  @Get()
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
