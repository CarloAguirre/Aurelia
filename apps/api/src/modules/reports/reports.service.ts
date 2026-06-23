import { Injectable } from '@nestjs/common';
import { ReportFilterRequest, ReportSummaryResponse } from '@aurelia/contracts';

@Injectable()
export class ReportsService {
  async summary(_filter: ReportFilterRequest): Promise<ReportSummaryResponse> {
    // Skeleton: la agregación real se implementará sobre los repositorios.
    return {
      totalInspections: 0,
      totalIncidents: 0,
      openIncidents: 0,
      byRiskLevel: {},
      byStatus: {},
    };
  }
}
