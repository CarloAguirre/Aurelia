import { Controller, Get } from '@nestjs/common';
import type { MobileBootstrapResponse } from '@aurelia/contracts';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import { MobileBootstrapService } from './mobile-bootstrap.service';

@RequirePermissions('mobile:read')
@Controller('mobile/bootstrap')
export class MobileBootstrapController {
  constructor(private readonly mobileBootstrapService: MobileBootstrapService) {}

  @Get()
  getBootstrap(): Promise<MobileBootstrapResponse> {
    return this.mobileBootstrapService.buildBootstrap();
  }
}
