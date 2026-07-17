import { Injectable } from '@nestjs/common';
import type { InspectionPeriodicReportRequest } from '@aurelia/contracts';
import type { AccessTokenPayload } from '../auth/jwt-token.service';
import { InspectionPeriodicReportPdfService } from './inspection-periodic-report-pdf.service';
import { InspectionPeriodicReportService } from './inspection-periodic-report.service';
import { InspectionPeriodicReportXlsxService } from './inspection-periodic-report-xlsx.service';

export interface InspectionPeriodicReportFile {
  filename: string;
  buffer: Buffer;
}

@Injectable()
export class InspectionPeriodicReportExportService {
  constructor(
    private readonly reports: InspectionPeriodicReportService,
    private readonly pdf: InspectionPeriodicReportPdfService,
    private readonly xlsx: InspectionPeriodicReportXlsxService,
  ) {}

  async renderPdf(
    request: InspectionPeriodicReportRequest,
    user: AccessTokenPayload,
  ): Promise<InspectionPeriodicReportFile> {
    const report = await this.reports.build(request, user);
    return this.pdf.render(report);
  }

  async renderXlsx(
    request: InspectionPeriodicReportRequest,
    user: AccessTokenPayload,
  ): Promise<InspectionPeriodicReportFile> {
    const report = await this.reports.build(request, user);
    return this.xlsx.render(report);
  }
}
