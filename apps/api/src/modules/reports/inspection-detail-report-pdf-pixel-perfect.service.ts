import { Injectable } from '@nestjs/common';
import { InspectionFindingStatus } from '@aurelia/contracts';
import { FilesService } from '../files/files.service';
import { InspectionDetailReportPdfFidelityService } from './inspection-detail-report-pdf-fidelity.service';
import { InspectionDetailReportPdfFinalService } from './inspection-detail-report-pdf-final.service';
import { InspectionDetailReportPdfService } from './inspection-detail-report-pdf.service';
import { ReportPdfService, type ReportPdfDocument } from './report-pdf.service';

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

type BaseRenderer = {
  render: (payload: Record<string, unknown>) => Promise<Buffer>;
  renderFinding: (
    document: ReportPdfDocument,
    context: ReportContext,
    finding: UnknownRecord,
    groupIndex: number,
    group: FindingGroup,
    assets: Map<string, EvidenceAsset>,
  ) => void;
};

type FidelityRenderer = {
  drawPersistentGroupTitle: (
    document: ReportPdfDocument,
    group: FindingGroup,
    count: number,
  ) => void;
  drawBorderedFinding: (
    document: ReportPdfDocument,
    context: ReportContext,
    finding: UnknownRecord,
    groupIndex: number,
    group: FindingGroup,
    assets: Map<string, EvidenceAsset>,
    baseFinding: BaseRenderer['renderFinding'],
  ) => void;
  buildFidelityTimeline: (
    inspection: UnknownRecord,
    findings: UnknownRecord[],
    comments: UnknownRecord[],
  ) => TimelineEvent[];
};

type PixelPerfectRuntime = {
  generatedAt: string;
  reportString: (value: unknown) => string;
  reportArray: (value: unknown) => unknown[];
  reportRecord: (value: unknown) => UnknownRecord;
  prepareFinding: (finding: UnknownRecord, generatedAt: string) => UnknownRecord;
  detailedSlaLabel: (finding: UnknownRecord) => string;
  normalizeValue: (value: unknown) => string;
  asString: (value: unknown) => string;
  asNumber: (value: unknown, fallback: number) => number;
  drawChip: (
    document: ReportPdfDocument,
    label: string,
    x: number,
    y: number,
    width: number,
    background: string,
    color: string,
  ) => void;
  severityLabel: (value: string) => string;
  severityBackground: (value: string) => string;
  severityColor: (value: string) => string;
  statusColors: (value: string) => { background: string; text: string };
  statusLabel: (value: string) => string;
  shortName: (value: string) => string;
  slaColor: (finding: UnknownRecord) => string;
  summarySlaLabel: (finding: UnknownRecord) => string;
  slaLabel: (finding: UnknownRecord) => string;
  addCompactPage: (document: ReportPdfDocument, context: ReportContext) => void;
  sectionTitle: (document: ReportPdfDocument, title: string) => void;
  estimateFindingHeight: (document: ReportPdfDocument, finding: UnknownRecord) => number;
  renderGroupsWithoutOrphanHeader: (
    document: ReportPdfDocument,
    context: ReportContext,
    findings: UnknownRecord[],
    assets: Map<string, EvidenceAsset>,
    runtime: PixelPerfectRuntime,
  ) => void;
  enrichTimelineEvents: (
    events: TimelineEvent[],
    inspection: UnknownRecord,
    findings: UnknownRecord[],
    runtime: PixelPerfectRuntime,
  ) => TimelineEvent[];
  drawFooters: (
    document: ReportPdfDocument,
    context: ReportContext,
    runtime: PixelPerfectRuntime,
  ) => void;
  drawFindingsSummaryTable: (
    document: ReportPdfDocument,
    context: ReportContext,
    findings: UnknownRecord[],
  ) => void;
  drawGroupTitle: (
    document: ReportPdfDocument,
    group: FindingGroup,
    count: number,
    continuation: boolean,
  ) => void;
  renderFinding: BaseRenderer['renderFinding'];
  renderFindingGroups: (
    document: ReportPdfDocument,
    context: ReportContext,
    findings: UnknownRecord[],
    assets: Map<string, EvidenceAsset>,
  ) => void;
  buildTimelineEvents: (
    inspection: UnknownRecord,
    findings: UnknownRecord[],
    comments: UnknownRecord[],
  ) => TimelineEvent[];
  drawTimelineEvent: (
    document: ReportPdfDocument,
    event: TimelineEvent,
    index: number,
    height: number,
  ) => void;
  addFooters: (document: ReportPdfDocument, context: ReportContext) => void;
};

type SummaryRow = {
  condition: string;
  conditionEn: string;
  spanishHeight: number;
  englishHeight: number;
  rowHeight: number;
};

const PAGE_WIDTH = 595.28;
const MARGIN_X = 42;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const CONTENT_BOTTOM = 780;
const NAVY = '#001E39';
const BLUE = '#0D3862';
const GOLD = '#C8A064';
const BORDER = '#D1D1D1';
const MUTED = '#646464';
const TEXT = '#131313';
const LIGHT = '#F7F7F7';
const YELLOW_BG = '#FFEAB8';

@Injectable()
export class InspectionDetailReportPdfPixelPerfectService extends InspectionDetailReportPdfFinalService {
  constructor(pdf: ReportPdfService, files: FilesService) {
    super(pdf, files);
  }

  override async render(payload: Record<string, unknown>): Promise<Buffer> {
    const runtime = this.pixelRuntime();
    const generatedAt = runtime.reportString(payload.generatedAt) || new Date().toISOString();
    const preparedPayload = {
      ...payload,
      generatedAt,
      findings: runtime.reportArray(payload.findings).map((value) =>
        runtime.prepareFinding(runtime.reportRecord(value), generatedAt),
      ),
    };

    runtime.slaLabel = (finding) => runtime.detailedSlaLabel(finding);
    runtime.generatedAt = generatedAt;
    runtime.asString = (value) => runtime.normalizeValue(value);

    const base = InspectionDetailReportPdfService.prototype as unknown as BaseRenderer;
    const fidelity = InspectionDetailReportPdfFidelityService.prototype as unknown as FidelityRenderer;
    const baseFinding = base.renderFinding.bind(this);

    runtime.drawFindingsSummaryTable = (document, context, findings) =>
      this.drawSummaryTable(document, context, findings, runtime);
    runtime.drawGroupTitle = (document, group, count) =>
      fidelity.drawPersistentGroupTitle.call(this, document, group, count);
    runtime.renderFinding = (document, context, finding, groupIndex, group, assets) =>
      fidelity.drawBorderedFinding.call(
        this,
        document,
        context,
        finding,
        groupIndex,
        group,
        assets,
        baseFinding,
      );
    runtime.renderFindingGroups = (document, context, findings, assets) =>
      runtime.renderGroupsWithoutOrphanHeader(document, context, findings, assets, runtime);
    runtime.buildTimelineEvents = (inspection, findings, comments) => {
      const events = fidelity.buildFidelityTimeline.call(this, inspection, findings, comments);
      const enrichedEvents = runtime.enrichTimelineEvents(events, inspection, findings, runtime);
      return enrichedEvents.map((event, index) => ({
        ...event,
        last: index === enrichedEvents.length - 1,
      }));
    };
    runtime.drawTimelineEvent = (document, event, _index, height) =>
      this.drawPixelTimelineEvent(document, event, height, runtime);
    runtime.addFooters = (document, context) => runtime.drawFooters(document, context, runtime);

    return base.render.call(this, preparedPayload);
  }

  private drawSummaryTable(
    document: ReportPdfDocument,
    context: ReportContext,
    findings: UnknownRecord[],
    runtime: PixelPerfectRuntime,
  ) {
    const widths = [27, 173.5, 87, 88.5, 75, 60];
    const headers = [
      'N°',
      'DESCRIPCIÓN / DESCRIPTION',
      'CRITICIDAD /\nCRITICALITY',
      'ESTADO / STATUS',
      'RESPONSABLE /\nRESPONSIBLE',
      'SLA',
    ];
    const rows = findings.map((finding) =>
      this.measureSummaryRow(document, finding, widths[1], runtime),
    );
    const startY = document.y;
    const totalHeight = 28 + rows.reduce((total, row) => total + row.rowHeight, 0);
    const fitsCurrentPage = findings.length > 0 && startY + totalHeight <= CONTENT_BOTTOM - 120;

    if (fitsCurrentPage) {
      document.save();
      document.roundedRect(MARGIN_X, startY, CONTENT_WIDTH, totalHeight, 5).clip();
    }

    const drawHeader = () => {
      let x = MARGIN_X;
      const y = document.y;
      headers.forEach((header, index) => {
        document.rect(x, y, widths[index], 28).fill(NAVY);
        document
          .font('Helvetica-Bold')
          .fontSize(5.3)
          .fillColor('#C4CED7')
          .text(header, x + 7, y + 8, {
            width: widths[index] - 14,
            align: index === 1 ? 'left' : 'center',
            lineGap: 0.5,
          });
        x += widths[index];
      });
      document.y = y + 28;
    };

    drawHeader();

    if (findings.length === 0) {
      const y = document.y;
      document.roundedRect(MARGIN_X, y, CONTENT_WIDTH, 34, 4).fillAndStroke(LIGHT, BORDER);
      document
        .font('Helvetica')
        .fontSize(7)
        .fillColor(MUTED)
        .text('No hay observaciones registradas en esta inspección.', MARGIN_X + 12, y + 12, {
          width: CONTENT_WIDTH - 24,
          align: 'center',
        });
      document.y = y + 34;
    } else {
      findings.forEach((finding, index) => {
        const row = rows[index];
        if (!fitsCurrentPage && document.y + row.rowHeight > CONTENT_BOTTOM - 120) {
          runtime.addCompactPage(document, context);
          runtime.sectionTitle(document, 'Resumen de observaciones / Observations summary');
          drawHeader();
        }
        this.drawSummaryRow(document, finding, row, widths, index, runtime);
      });
    }

    if (fitsCurrentPage) {
      document.restore();
      document
        .roundedRect(MARGIN_X, startY, CONTENT_WIDTH, document.y - startY, 5)
        .strokeColor(BORDER)
        .lineWidth(0.7)
        .stroke();
    }

    document.y += 14;
  }

  private measureSummaryRow(
    document: ReportPdfDocument,
    finding: UnknownRecord,
    descriptionColumnWidth: number,
    runtime: PixelPerfectRuntime,
  ): SummaryRow {
    const condition =
      runtime.asString(finding.detectedCondition) ||
      runtime.asString(finding.description) ||
      runtime.asString(finding.title) ||
      'Sin descripción';
    const conditionEn =
      runtime.asString(finding.detectedConditionEn) || runtime.asString(finding.descriptionEn);
    const textWidth = descriptionColumnWidth - 17;

    document.font('Helvetica-Bold').fontSize(7);
    const spanishHeight = Math.min(
      34,
      document.heightOfString(condition, { width: textWidth, lineGap: 0.4 }),
    );
    document.font('Helvetica-Oblique').fontSize(6.3);
    const englishHeight = conditionEn
      ? Math.min(26, document.heightOfString(conditionEn, { width: textWidth, lineGap: 0.4 }))
      : 0;
    const rowHeight = Math.max(
      43,
      8 + spanishHeight + (englishHeight > 0 ? englishHeight + 2 : 0) + 8,
    );

    return { condition, conditionEn, spanishHeight, englishHeight, rowHeight };
  }

  private drawSummaryRow(
    document: ReportPdfDocument,
    finding: UnknownRecord,
    row: SummaryRow,
    widths: number[],
    index: number,
    runtime: PixelPerfectRuntime,
  ) {
    const y = document.y;
    const fill = index % 2 === 0 ? '#FFFFFF' : LIGHT;
    let x = MARGIN_X;
    widths.forEach((width) => {
      document.rect(x, y, width, row.rowHeight).fillAndStroke(fill, BORDER);
      x += width;
    });

    document
      .font('Helvetica-Bold')
      .fontSize(7.2)
      .fillColor(BLUE)
      .text(String(runtime.asNumber(finding.observationNumber, index + 1)), MARGIN_X, y + 9, {
        width: widths[0],
        align: 'center',
      });

    const descriptionX = MARGIN_X + widths[0] + 9;
    const descriptionWidth = widths[1] - 17;
    document
      .font('Helvetica-Bold')
      .fontSize(7)
      .fillColor(TEXT)
      .text(row.condition, descriptionX, y + 8, {
        width: descriptionWidth,
        height: row.spanishHeight,
        lineGap: 0.4,
        ellipsis: true,
      });

    if (row.conditionEn) {
      document
        .font('Helvetica-Oblique')
        .fontSize(6.3)
        .fillColor(MUTED)
        .text(row.conditionEn, descriptionX, y + 8 + row.spanishHeight + 2, {
          width: descriptionWidth,
          height: row.englishHeight,
          lineGap: 0.4,
          ellipsis: true,
        });
    }

    const severityX = MARGIN_X + widths[0] + widths[1];
    runtime.drawChip(
      document,
      runtime.severityLabel(runtime.asString(finding.severity)),
      severityX + 8,
      y + 9,
      widths[2] - 16,
      runtime.severityBackground(runtime.asString(finding.severity)),
      runtime.severityColor(runtime.asString(finding.severity)),
    );

    const statusX = severityX + widths[2];
    const statusColors = runtime.statusColors(runtime.asString(finding.status));
    runtime.drawChip(
      document,
      runtime.statusLabel(runtime.asString(finding.status)),
      statusX + 8,
      y + 9,
      widths[3] - 16,
      statusColors.background,
      statusColors.text,
    );

    const responsibleX = statusX + widths[3];
    document
      .font('Helvetica')
      .fontSize(6.5)
      .fillColor(TEXT)
      .text(
        runtime.shortName(runtime.asString(finding.ownerUserName)) ||
          runtime.asString(finding.responsibleCompanyName) ||
          '—',
        responsibleX + 8,
        y + 9,
        { width: widths[4] - 16, height: row.rowHeight - 14, ellipsis: true },
      );

    const slaX = responsibleX + widths[4];
    document
      .font('Helvetica-Bold')
      .fontSize(6.4)
      .fillColor(runtime.slaColor(finding))
      .text(runtime.summarySlaLabel(finding), slaX + 8, y + 9, {
        width: widths[5] - 14,
        height: row.rowHeight - 14,
        ellipsis: true,
      });

    document.y = y + row.rowHeight;
  }

  private drawPixelTimelineEvent(
    document: ReportPdfDocument,
    event: TimelineEvent,
    height: number,
    runtime: PixelPerfectRuntime,
  ) {
    const y = document.y;
    const circleX = MARGIN_X + 8;
    const circleY = y + 8;
    const radius = 8.5;

    if (!event.last) {
      document
        .moveTo(circleX, circleY)
        .lineTo(circleX, y + height + 8)
        .strokeColor(BORDER)
        .lineWidth(0.8)
        .stroke();
    }

    document.circle(circleX, circleY, radius).fill(event.color);

    if (event.ongoing || event.color === GOLD) {
      document
        .moveTo(circleX - 3, circleY)
        .lineTo(circleX + 3.1, circleY)
        .strokeColor(NAVY)
        .lineWidth(1)
        .stroke();
      document
        .moveTo(circleX + 0.8, circleY - 2.7)
        .lineTo(circleX + 3.5, circleY)
        .lineTo(circleX + 0.8, circleY + 2.7)
        .strokeColor(NAVY)
        .lineWidth(1)
        .stroke();
    } else {
      document
        .moveTo(circleX - 3.1, circleY)
        .lineTo(circleX - 0.7, circleY + 2.2)
        .lineTo(circleX + 3.6, circleY - 2.3)
        .strokeColor('#FFFFFF')
        .lineWidth(1.05)
        .stroke();
    }

    document
      .font('Helvetica-Bold')
      .fontSize(8.2)
      .fillColor(TEXT)
      .text(event.title, MARGIN_X + 26, y, { width: 330 });

    const dateLabel = event.ongoing
      ? `${runtime.reportString(event.date) ? this.formatDateFromRuntime(event.date, runtime) : '—'} · Estado actual / Current status`
      : this.formatDateTimeFromRuntime(event.date, runtime);
    document
      .font('Helvetica')
      .fontSize(6.5)
      .fillColor(MUTED)
      .text(dateLabel, MARGIN_X + 350, y + 1, { width: 160, align: 'right' });

    const [spanishDetail, ...englishParts] = event.detail.split('\n');
    const englishDetail = englishParts.join('\n').trim();
    const detailX = MARGIN_X + 26;
    const detailY = y + 17;
    const detailWidth = CONTENT_WIDTH - 26;

    document
      .font('Helvetica')
      .fontSize(7.4)
      .fillColor('#333333')
      .text(spanishDetail, detailX, detailY, { width: detailWidth, lineGap: 1.5 });

    if (englishDetail) {
      document.font('Helvetica').fontSize(7.4);
      const spanishHeight = document.heightOfString(spanishDetail, {
        width: detailWidth,
        lineGap: 1.5,
      });
      document
        .font('Helvetica-Oblique')
        .fontSize(7.1)
        .fillColor(MUTED)
        .text(englishDetail, detailX, detailY + spanishHeight + 1, {
          width: detailWidth,
          lineGap: 1.5,
        });
    }

    if (event.summary) {
      const summaryY = y + height - 28;
      document
        .roundedRect(MARGIN_X + 26, summaryY, CONTENT_WIDTH - 26, 22, 3)
        .fillAndStroke(event.ongoing ? YELLOW_BG : LIGHT, event.ongoing ? GOLD : BORDER);
      document
        .font('Helvetica')
        .fontSize(6.4)
        .fillColor(MUTED)
        .text(event.summary, MARGIN_X + 34, summaryY + 7, {
          width: CONTENT_WIDTH - 42,
          height: 10,
          ellipsis: true,
        });
    }

    document.y = y + height;
  }

  private formatDateFromRuntime(value: string, runtime: PixelPerfectRuntime): string {
    const formatter = runtime as unknown as { formatDate: (date: string) => string };
    return formatter.formatDate(value);
  }

  private formatDateTimeFromRuntime(value: string, runtime: PixelPerfectRuntime): string {
    const formatter = runtime as unknown as { formatDateTime: (date: string) => string };
    return formatter.formatDateTime(value);
  }

  private pixelRuntime(): PixelPerfectRuntime {
    return this as unknown as PixelPerfectRuntime;
  }
}