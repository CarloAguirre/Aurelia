import { Injectable } from '@nestjs/common';
import { FilesService } from '../files/files.service';
import { InspectionDetailReportPdfFidelityService } from './inspection-detail-report-pdf-fidelity.service';
import { InspectionDetailReportPdfService } from './inspection-detail-report-pdf.service';
import { ReportPdfService } from './report-pdf.service';

type Runtime = Record<string, (...args: unknown[]) => unknown> & {
  generatedAt: string;
};

@Injectable()
export class InspectionDetailReportPdfRuntimeService extends InspectionDetailReportPdfFidelityService {
  constructor(pdf: ReportPdfService, files: FilesService) {
    super(pdf, files);
  }

  override async render(payload: Record<string, unknown>): Promise<Buffer> {
    const runtime = this as unknown as Runtime;
    const base = InspectionDetailReportPdfService.prototype as unknown as Runtime;
    const fidelity = InspectionDetailReportPdfFidelityService.prototype as unknown as Runtime;
    runtime.generatedAt = typeof payload.generatedAt === 'string' ? payload.generatedAt : new Date().toISOString();
    const baseSummaryTable = base.drawFindingsSummaryTable.bind(this);
    const baseFinding = base.renderFinding.bind(this);

    runtime.drawFindingsSummaryTable = (...args) => fidelity.drawRoundedSummaryTable.call(this, ...args, baseSummaryTable);
    runtime.drawGroupTitle = (document, group, count) => fidelity.drawPersistentGroupTitle.call(this, document, group, count);
    runtime.renderFinding = (...args) => fidelity.drawBorderedFinding.call(this, ...args, baseFinding);
    runtime.buildTimelineEvents = (...args) => fidelity.buildFidelityTimeline.call(this, ...args);
    runtime.drawTimelineEvent = (...args) => fidelity.drawFidelityTimelineEvent.call(this, ...args);

    return base.render.call(this, payload) as Promise<Buffer>;
  }
}
