import { Controller, Get, Query } from '@nestjs/common';
import { ReportFilterRequest, ReportSummaryResponse } from '@aurelia/contracts';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  summary(@Query() filter: ReportFilterRequest): Promise<ReportSummaryResponse> {
    return this.reportsService.summary(filter);
  }
}
