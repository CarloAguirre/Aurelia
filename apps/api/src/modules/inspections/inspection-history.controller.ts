import { Controller, Get, Query } from '@nestjs/common';
import type { InspectionHistoryKpisResponse, InspectionManagementTableResponse } from '@aurelia/contracts';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import type { ManagementTableQuery } from './inspection-dashboard.service';
import { InspectionHistoryService } from './inspection-history.service';

@RequirePermissions('inspections:read')
@Controller('inspections/history')
export class InspectionHistoryController {
  constructor(private readonly inspectionHistoryService: InspectionHistoryService) {}

  @Get('kpis')
  getHistoryKpis(): Promise<InspectionHistoryKpisResponse> {
    return this.inspectionHistoryService.getHistoryKpis();
  }

  @Get('table')
  getHistoryTable(@Query() query: ManagementTableQuery): Promise<InspectionManagementTableResponse> {
    return this.inspectionHistoryService.getHistoryTable(query);
  }
}
