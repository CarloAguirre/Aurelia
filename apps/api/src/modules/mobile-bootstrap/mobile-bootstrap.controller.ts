import { Controller, Get } from '@nestjs/common';
import type { MobileBootstrapResponse } from '@aurelia/contracts';
import { MobileBootstrapService } from './mobile-bootstrap.service';

@Controller('mobile/bootstrap')
export class MobileBootstrapController {
  constructor(private readonly mobileBootstrapService: MobileBootstrapService) {}

  @Get()
  getBootstrap(): Promise<MobileBootstrapResponse> {
    return this.mobileBootstrapService.buildBootstrap();
  }
}
