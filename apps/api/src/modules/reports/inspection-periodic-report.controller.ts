import { Controller, Get, Query, Req } from '@nestjs/common';
import type { InspectionPeriodicReportRequest, InspectionPeriodicReportResponse } from '@aurelia/contracts';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import { InspectionPeriodicReportService } from './inspection-periodic-report.service';

@RequirePermissions('inspections:read')
@Controller('reports/inspections/periodic')
export class InspectionPeriodicReportController {
  constructor(private readonly reports: InspectionPeriodicReportService) {}

  @Get('data')
  getData(
    @Query() query: InspectionPeriodicReportRequest,
    @Req() request: AuthenticatedRequest,
  ): Promise<InspectionPeriodicReportResponse> {
    return this.reports.build(query, request.user);
  }
}
