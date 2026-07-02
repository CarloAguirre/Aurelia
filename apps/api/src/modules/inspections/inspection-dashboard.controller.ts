import { Controller, Get } from '@nestjs/common';
import { InspectionDashboardChartsResponse } from '@aurelia/contracts';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import { InspectionDashboardService } from './inspection-dashboard.service';

@RequirePermissions('inspections:read')
@Controller('inspections/dashboard')
export class InspectionDashboardController {
  constructor(private readonly inspectionDashboardService: InspectionDashboardService) {}

  @Get('charts')
  getCharts(): Promise<InspectionDashboardChartsResponse> {
    return this.inspectionDashboardService.getCharts();
  }
}
