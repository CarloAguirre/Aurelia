import { Injectable } from '@nestjs/common';
import { InspectionFindingStatus } from '@aurelia/contracts';
import { FilesService } from '../files/files.service';
import { InspectionDetailReportPdfFidelityService } from './inspection-detail-report-pdf-fidelity.service';
import { InspectionDetailReportPdfService } from './inspection-detail-report-pdf.service';
import { ReportPdfService, type ReportPdfDocument } from './report-pdf.service';

type RuntimeMethod = (...args: unknown[]) => unknown;
type UnknownRecord = Record<string, unknown>;

type ReportContext = {
  inspectionNumber: string;
  generatedAt: string;
  inspectionDate: string;
};

type EvidenceAsset = {
  path: string;
  mimeType: string | null;
};

type FindingGroup = {
  statuses: InspectionFindingStatus[];
  title: string;
  badgeSuffix: string;
  color: string;
  background: string;
  textColor: string;
};

type TimelineEvent = {
  date: string;
  title: string;
  detail: string;
  summary: string;
  color: string;
  ongoing?: boolean;
  last?: boolean;
};

type Runtime = {
  generatedAt: string;
  asString: (value: unknown) => string;
  formatDate: (value: string) => string;
  formatDateTime: (value: string) => string;
  drawFindingsSummaryTable: RuntimeMethod;
  drawGroupTitle: (document: ReportPdfDocument, group: FindingGroup, count: number, continuation: boolean) => void;
  renderFinding: (
    document: ReportPdfDocument,
    context: ReportContext,
    finding: UnknownRecord,
    groupIndex: number,
    group: FindingGroup,
    assets: Map<string, EvidenceAsset>,
  ) => void;
  renderFindingGroups: RuntimeMethod;
  estimateFindingHeight: (document: ReportPdfDocument, finding: UnknownRecord) => number;
  addCompactPage: (document: ReportPdfDocument, context: ReportContext) => void;
  buildTimelineEvents: RuntimeMethod;
  drawTimelineEvent: RuntimeMethod;
  drawRoundedSummaryTable: RuntimeMethod;
  drawPersistentGroupTitle: RuntimeMethod;
  drawBorderedFinding: RuntimeMethod;
  buildFidelityTimeline: RuntimeMethod;
  render: RuntimeMethod;
};

const MARGIN_X = 42;
const CONTENT_WIDTH = 595.28 - MARGIN_X * 2;
const CONTENT_BOTTOM = 780;
const NAVY = '#001E39';
const GOLD = '#C8A064';
const BORDER = '#D1D1D1';
const MUTED = '#646464';
const TEXT = '#131313';
const LIGHT = '#F7F7F7';
const YELLOW_BG = '#FFEAB8';
const GREEN = '#2A5C16';
const GREEN_BORDER = '#6CC24A';
const GREEN_BG = '#E0FFD3';
const TEAL = '#006153';
const TEAL_BORDER = '#00B398';
const TEAL_BG = '#C5FFF6';
const RED = '#570B1D';
const RED_BORDER = '#BD3B5B';
const RED_BG = '#FFD0DB';
const YELLOW = '#463100';
const YELLOW_BORDER = '#E8A820';

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
    runtime.asString = (value) => this.normalizeValue(value);
    const baseSummaryTable = base.drawFindingsSummaryTable.bind(this);
    const baseFinding = base.renderFinding.bind(this);

    runtime.drawFindingsSummaryTable = (...args) => fidelity.drawRoundedSummaryTable.call(this, ...args, baseSummaryTable);
    runtime.drawGroupTitle = (document, group, count) => fidelity.drawPersistentGroupTitle.call(this, document, group, count);
    runtime.renderFinding = (...args) => fidelity.drawBorderedFinding.call(this, ...args, baseFinding);
    runtime.renderFindingGroups = (...args) => {
      this.renderGroupsWithoutOrphanHeader(
        args[0] as ReportPdfDocument,
        args[1] as ReportContext,
        args[2] as UnknownRecord[],
        args[3] as Map<string, EvidenceAsset>,
        runtime,
      );
    };
    runtime.buildTimelineEvents = (...args) => {
      const events = fidelity.buildFidelityTimeline.call(this, ...args) as TimelineEvent[];
      return events.map((event, index) => ({ ...event, last: index === events.length - 1 }));
    };
    runtime.drawTimelineEvent = (...args) => {
      const [document, event, , height] = args;
      this.drawConnectedTimelineEvent(
        document as ReportPdfDocument,
        event as TimelineEvent,
        Number(height),
        runtime,
      );
    };

    return base.render.call(this, payload) as Promise<Buffer>;
  }

  private renderGroupsWithoutOrphanHeader(
    document: ReportPdfDocument,
    context: ReportContext,
    findings: UnknownRecord[],
    assets: Map<string, EvidenceAsset>,
    runtime: Runtime,
  ) {
    const groups: FindingGroup[] = [
      {
        statuses: [InspectionFindingStatus.IN_PROGRESS],
        title: 'Observaciones ejecutadas / Executed observations',
        badgeSuffix: 'Pendiente aprobación Admin GF / Pending Admin GF approval',
        color: TEAL_BORDER,
        background: TEAL_BG,
        textColor: TEAL,
      },
      {
        statuses: [InspectionFindingStatus.OPEN],
        title: 'Observaciones abiertas / Open observations',
        badgeSuffix: 'Pendiente EECC / Pending EECC',
        color: YELLOW_BORDER,
        background: YELLOW_BG,
        textColor: YELLOW,
      },
      {
        statuses: [InspectionFindingStatus.CLOSED],
        title: 'Observaciones cerradas / Closed observations',
        badgeSuffix: '',
        color: GREEN_BORDER,
        background: GREEN_BG,
        textColor: GREEN,
      },
      {
        statuses: [InspectionFindingStatus.REJECTED],
        title: 'Observaciones rechazadas / Rejected observations',
        badgeSuffix: 'Pendiente de corrección / Pending correction',
        color: RED_BORDER,
        background: RED_BG,
        textColor: RED,
      },
      {
        statuses: [InspectionFindingStatus.CANCELLED],
        title: 'Observaciones canceladas / Cancelled observations',
        badgeSuffix: '',
        color: BORDER,
        background: LIGHT,
        textColor: MUTED,
      },
    ];

    for (const group of groups) {
      const rows = findings.filter((finding) => group.statuses.includes(runtime.asString(finding.status) as InspectionFindingStatus));
      if (rows.length === 0) continue;

      const firstFindingHeight = runtime.estimateFindingHeight(document, rows[0]);
      if (document.y + 25 + firstFindingHeight > CONTENT_BOTTOM) {
        runtime.addCompactPage(document, context);
      }

      runtime.drawGroupTitle(document, group, rows.length, false);
      rows.forEach((finding, index) => {
        const required = runtime.estimateFindingHeight(document, finding);
        if (document.y + required > CONTENT_BOTTOM) {
          runtime.addCompactPage(document, context);
          runtime.drawGroupTitle(document, group, rows.length, true);
        }
        runtime.renderFinding(document, context, finding, index, group, assets);
      });
    }
  }

  private normalizeValue(value: unknown): string {
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number') return String(value);
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
    return '';
  }

  private drawConnectedTimelineEvent(
    document: ReportPdfDocument,
    event: TimelineEvent,
    height: number,
    runtime: Runtime,
  ) {
    const y = document.y;
    const circleX = MARGIN_X + 8;
    if (!event.last) {
      document
        .moveTo(circleX, y + 8)
        .lineTo(circleX, y + height + 8)
        .strokeColor(BORDER)
        .lineWidth(0.8)
        .stroke();
    }
    document.circle(circleX, y + 8, 9).fill(event.color);
    if (event.ongoing || event.color === GOLD) {
      document.moveTo(circleX - 3.3, y + 8).lineTo(circleX + 3.5, y + 8).strokeColor(NAVY).lineWidth(1.1).stroke();
      document.moveTo(circleX + 1, y + 5).lineTo(circleX + 4, y + 8).lineTo(circleX + 1, y + 11).strokeColor(NAVY).lineWidth(1.1).stroke();
    } else {
      document.moveTo(circleX - 3.5, y + 8).lineTo(circleX - 0.8, y + 10.5).lineTo(circleX + 4, y + 5.5).strokeColor('#FFFFFF').lineWidth(1.2).stroke();
    }
    document.font('Helvetica-Bold').fontSize(8.2).fillColor(TEXT).text(event.title, MARGIN_X + 26, y, { width: 330 });
    const dateLabel = event.ongoing
      ? `${runtime.formatDate(event.date)} · Estado actual / Current status`
      : runtime.formatDateTime(event.date);
    document.font('Helvetica').fontSize(6.5).fillColor(MUTED).text(dateLabel, MARGIN_X + 350, y + 1, { width: 160, align: 'right' });
    document.font('Helvetica').fontSize(7.4).fillColor('#333333').text(event.detail, MARGIN_X + 26, y + 17, { width: CONTENT_WIDTH - 26, lineGap: 1.5 });
    if (event.summary) {
      const summaryY = y + height - 28;
      document.roundedRect(MARGIN_X + 26, summaryY, CONTENT_WIDTH - 26, 22, 3).fillAndStroke(event.ongoing ? YELLOW_BG : LIGHT, event.ongoing ? GOLD : BORDER);
      document.font('Helvetica').fontSize(6.4).fillColor(MUTED).text(event.summary, MARGIN_X + 34, summaryY + 7, {
        width: CONTENT_WIDTH - 42,
        height: 10,
        ellipsis: true,
      });
    }
    document.y = y + height;
  }
}
