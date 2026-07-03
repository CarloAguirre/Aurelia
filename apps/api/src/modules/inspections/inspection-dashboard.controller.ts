import { Controller, Get } from '@nestjs/common';
import type {
  InspectionDashboardChartsResponse,
  InspectionDashboardCompanyAnalysisResponse,
  InspectionDashboardOpenFindingsResponse,
} from '@aurelia/contracts';
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

  @Get('company-analysis')
  getCompanyAnalysis(): Promise<InspectionDashboardCompanyAnalysisResponse> {
    return this.inspectionDashboardService.getCompanyAnalysis();
  }

  @Get('open-findings')
  getOpenFindings(): Promise<InspectionDashboardOpenFindingsResponse> {
    return this.inspectionDashboardService.getOpenFindings();
  }
}
