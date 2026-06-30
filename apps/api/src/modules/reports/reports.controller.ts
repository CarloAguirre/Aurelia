import { Controller, Get, Query } from '@nestjs/common';
import { ReportFilterRequest, ReportSummaryResponse } from '@aurelia/contracts';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import {
  CountReportRow,
  IncidentSummaryReport,
  InspectionSummaryReport,
  OpenItemsReport,
  PeriodReportRow,
  ReportsService,
} from './reports.service';

type ReportQuery = ReportFilterRequest & {
  companyId?: string;
  status?: string;
};

@RequirePermissions('inspections:read', 'incidents:read')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  summary(@Query() filter: ReportQuery): Promise<ReportSummaryResponse> {
    return this.reportsService.summary(filter);
  }

  @Get('inspections/summary')
  inspectionsSummary(@Query() filter: ReportQuery): Promise<InspectionSummaryReport> {
    return this.reportsService.inspectionsSummary(filter);
  }

  @Get('incidents/summary')
  incidentsSummary(@Query() filter: ReportQuery): Promise<IncidentSummaryReport> {
    return this.reportsService.incidentsSummary(filter);
  }

  @Get('incidents/by-level')
  incidentsByLevel(@Query() filter: ReportQuery): Promise<CountReportRow[]> {
    return this.reportsService.incidentsByLevel(filter);
  }

  @Get('incidents/by-type')
  incidentsByType(@Query() filter: ReportQuery): Promise<CountReportRow[]> {
    return this.reportsService.incidentsByType(filter);
  }

  @Get('incidents/by-company')
  incidentsByCompany(@Query() filter: ReportQuery): Promise<CountReportRow[]> {
    return this.reportsService.incidentsByCompany(filter);
  }

  @Get('incidents/by-period')
  incidentsByPeriod(@Query() filter: ReportQuery): Promise<PeriodReportRow[]> {
    return this.reportsService.incidentsByPeriod(filter);
  }

  @Get('open-items')
  openItems(@Query() filter: ReportQuery): Promise<OpenItemsReport> {
    return this.reportsService.openItems(filter);
  }
}
