import { Controller, Get, Query } from '@nestjs/common';
import type {
  InspectionDashboardChartsResponse,
  InspectionDashboardCompanyAnalysisResponse,
  InspectionDashboardOpenFindingsResponse,
  InspectionDashboardSummaryResponse,
  InspectionManagementKpisResponse,
  InspectionManagementTableResponse,
} from '@aurelia/contracts';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import { InspectionDashboardService, type ManagementTableQuery } from './inspection-dashboard.service';
import type { DashboardQuery } from './inspection-dashboard-period';

@RequirePermissions('inspections:read')
@Controller('inspections/dashboard')
export class InspectionDashboardController {
  constructor(private readonly inspectionDashboardService: InspectionDashboardService) {}

  @Get('management-kpis')
  getManagementKpis(): Promise<InspectionManagementKpisResponse> {
    return this.inspectionDashboardService.getManagementKpis();
  }

  @Get('management-table')
  getManagementTable(@Query() query: ManagementTableQuery): Promise<InspectionManagementTableResponse> {
    return this.inspectionDashboardService.getManagementTable(query);
  }

  @Get('filtered-summary')
  getSummary(@Query() query: DashboardQuery): Promise<InspectionDashboardSummaryResponse> {
    return this.inspectionDashboardService.getSummary(query);
  }

  @Get('charts')
  getCharts(@Query() query: DashboardQuery): Promise<InspectionDashboardChartsResponse> {
    return this.inspectionDashboardService.getCharts(query);
  }

  @Get('company-analysis')
  getCompanyAnalysis(@Query() query: DashboardQuery): Promise<InspectionDashboardCompanyAnalysisResponse> {
    return this.inspectionDashboardService.getCompanyAnalysis(query);
  }

  @Get('open-findings')
  getOpenFindings(@Query() query: DashboardQuery): Promise<InspectionDashboardOpenFindingsResponse> {
    return this.inspectionDashboardService.getOpenFindings(query);
  }
}
