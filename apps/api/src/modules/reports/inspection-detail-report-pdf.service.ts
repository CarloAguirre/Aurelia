import { Injectable } from '@nestjs/common';
import { InspectionFindingStatus } from '@aurelia/contracts';
import { FilesService } from '../files/files.service';
import { ReportPdfService, type ReportPdfDocument } from './report-pdf.service';

type UnknownRecord = Record<string, unknown>;

type ReportContext = {
  inspectionNumber: string;
  generatedAt: string;
  title: string;
};

type EvidenceAsset = {
  path: string;
  mimeType: string | null;
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 44;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const CONTENT_BOTTOM = 792;
const NAVY = '#001E39';
const BLUE = '#24588B';
const GOLD = '#C8A064';
const BORDER = '#D1D1D1';
const MUTED = '#646464';
const LIGHT = '#F7F7F7';
const GREEN = '#2A5C16';
const GREEN_BG = '#E0FFD3';
const TEAL = '#006153';
const TEAL_BG = '#C5FFF6';
const RED = '#570B1D';
const RED_BG = '#FFD0DB';
const ORANGE = '#69462E';
const ORANGE_BG = '#FBE1D0';
const YELLOW = '#463100';
const YELLOW_BG = '#FFEAB8';

@Injectable()
export class InspectionDetailReportPdfService {
  constructor(
    private readonly pdf: ReportPdfService,
    private readonly files: FilesService,
  ) {}

  async render(payload: Record<string, unknown>): Promise<Buffer> {
    const inspection = this.asRecord(payload.inspection);
    const findings = this.asArray(payload.findings).map((value) => this.asRecord(value));
    const comments = this.asArray(payload.comments).map((value) => this.asRecord(value));
    const inspectionNumber = this.asString(inspection.inspectionNumber) || this.resolveNumber(this.asString(inspection.title));
    const generatedAt = this.asString(payload.generatedAt) || new Date().toISOString();
    const context: ReportContext = {
      inspectionNumber,
      generatedAt,
      title: this.asString(inspection.title) || `Inspección #${inspectionNumber}`,
    };
    const assets = await this.loadEvidenceAssets(payload);

    return this.pdf.render(async (document) => {
      this.addPage(document, context);
      this.renderCover(document, context, inspection, findings, payload, assets);
      this.renderFindingGroups(document, context, findings, assets);
      this.renderRejectedSection(document, context, findings, assets);
      this.renderTimeline(document, context, inspection, findings, comments);
      this.addFooters(document, context);
    }, {
      title: `Inspección ${inspectionNumber}`,
      subject: `Informe detallado de inspección ${inspectionNumber}`,
    });
  }

  private renderCover(
    document: ReportPdfDocument,
    context: ReportContext,
    inspection: UnknownRecord,
    findings: UnknownRecord[],
    payload: Record<string, unknown>,
    assets: Map<string, EvidenceAsset>,
  ) {
    document.font('Helvetica-Bold').fontSize(16).fillColor(NAVY).text(context.title, MARGIN_X, document.y, { width: CONTENT_WIDTH });
    document.moveDown(0.35);
    document.font('Helvetica').fontSize(7.5).fillColor(MUTED).text(this.asString(inspection.description) || 'Informe detallado de inspección y observaciones', { width: CONTENT_WIDTH });
    document.moveDown(0.75);

    const summary = this.asRecord(payload.summary);
    const closed = findings.filter((finding) => this.asString(finding.status) === InspectionFindingStatus.CLOSED).length;
    const closureRate = findings.length > 0 ? Math.round((closed / findings.length) * 100) : 0;
    this.drawMetricRow(document, [
      ['N° inspección', `#${context.inspectionNumber}`],
      ['Fecha', this.formatDate(this.asString(inspection.startedAt) || this.asString(inspection.scheduledAt) || this.asString(inspection.createdAt))],
      ['Estado', this.statusLabel(this.asString(inspection.status))],
      ['% de cierre', `${closureRate}%`],
    ]);

    this.sectionTitle(document, 'Datos generales y hallazgos / observaciones');
    this.drawKeyValueGrid(document, [
      ['Inspector', this.asString(inspection.inspectorName) || 'Sin inspector'],
      ['Empresa inspector', this.asString(inspection.inspectorCompanyName) || this.asString(inspection.companyName) || 'Sin empresa'],
      ['Empresa inspeccionada', this.asString(inspection.companyName) || 'Sin empresa'],
      ['Área / sector', this.joinLabel(this.asString(inspection.areaName), this.asString(inspection.sectorName))],
      ['Tipo de inspección', this.asString(inspection.inspectionTypeName) || 'Sin tipo'],
      ['Ubicación', this.asString(inspection.locationLabel) || this.joinCoordinates(inspection.latitude, inspection.longitude)],
      ['Fecha inicio', this.formatDateTime(this.asString(inspection.startedAt) || this.asString(inspection.createdAt))],
      ['Fecha cierre', this.formatDateTime(this.asString(inspection.closedAt))],
    ]);

    document.moveDown(0.6);
    this.drawFindingsSummaryTable(document, findings);

    const generalEvidence = this.findGeneralEvidence(payload, findings);
    this.sectionTitle(document, 'Fotografía general de la inspección');
    const asset = generalEvidence ? assets.get(this.asString(generalEvidence.fileId)) : undefined;
    this.drawImagePanel(document, asset, generalEvidence ? this.asString(generalEvidence.title) : '', CONTENT_WIDTH, 125, '#D6EEF8');

    document.font('Helvetica').fontSize(6.5).fillColor(MUTED).text(
      `${this.asNumber(summary.findingsCount, findings.length)} observaciones registradas · ${this.asNumber(summary.evidencesCount, 0)} evidencias · ${this.asNumber(summary.commentsCount, 0)} comentarios`,
      MARGIN_X,
      document.y + 8,
      { width: CONTENT_WIDTH, align: 'right' },
    );
  }

  private renderFindingGroups(
    document: ReportPdfDocument,
    context: ReportContext,
    findings: UnknownRecord[],
    assets: Map<string, EvidenceAsset>,
  ) {
    const groups = [
      {
        title: 'Observaciones ejecutadas / executed observations',
        statuses: [InspectionFindingStatus.IN_PROGRESS],
        color: TEAL,
        background: TEAL_BG,
      },
      {
        title: 'Observaciones abiertas / open observations',
        statuses: [InspectionFindingStatus.OPEN],
        color: YELLOW,
        background: YELLOW_BG,
      },
      {
        title: 'Observaciones cerradas / closed observations',
        statuses: [InspectionFindingStatus.CLOSED],
        color: GREEN,
        background: GREEN_BG,
      },
    ];

    for (const group of groups) {
      const rows = findings.filter((finding) => group.statuses.includes(this.asString(finding.status) as InspectionFindingStatus));
      if (rows.length === 0) continue;
      this.ensureSpace(document, context, 75);
      this.sectionTitle(document, `${group.title} · ${rows.length}`, group.color);
      rows.forEach((finding, index) => this.renderFinding(document, context, finding, index + 1, group.color, group.background, assets));
    }
  }

  private renderRejectedSection(
    document: ReportPdfDocument,
    context: ReportContext,
    findings: UnknownRecord[],
    assets: Map<string, EvidenceAsset>,
  ) {
    const rejected = findings.filter((finding) => this.asString(finding.status) === InspectionFindingStatus.REJECTED);
    this.ensureSpace(document, context, 75);
    this.sectionTitle(document, `Observaciones rechazadas / rejected observations · ${rejected.length}`, RED);
    if (rejected.length === 0) {
      this.drawEmptyState(document, 'No hay observaciones rechazadas en esta inspección.');
      return;
    }
    rejected.forEach((finding, index) => this.renderFinding(document, context, finding, index + 1, RED, RED_BG, assets));
  }

  private renderFinding(
    document: ReportPdfDocument,
    context: ReportContext,
    finding: UnknownRecord,
    index: number,
    color: string,
    background: string,
    assets: Map<string, EvidenceAsset>,
  ) {
    const condition = this.asString(finding.detectedCondition) || this.asString(finding.description) || this.asString(finding.title) || 'Sin descripción';
    const proposed = this.asString(finding.proposedCorrectiveAction) || 'Sin medida correctiva registrada';
    const executed = this.asString(finding.executedActionDescription);
    const rejected = this.asString(finding.rejectionReason);
    const textHeight = Math.min(135, 42 + document.heightOfString(condition, { width: CONTENT_WIDTH - 36 }) + document.heightOfString(proposed, { width: CONTENT_WIDTH - 36 }) + (executed ? document.heightOfString(executed, { width: CONTENT_WIDTH - 36 }) : 0) + (rejected ? document.heightOfString(rejected, { width: CONTENT_WIDTH - 36 }) : 0));
    const evidenceHeight = this.asArray(finding.evidences).length > 0 ? 122 : 0;
    const estimatedHeight = 76 + textHeight + evidenceHeight;
    this.ensureSpace(document, context, Math.min(estimatedHeight, 540));

    const startY = document.y;
    document.roundedRect(MARGIN_X, startY, CONTENT_WIDTH, 42, 5).fill(background);
    document.rect(MARGIN_X, startY, 4, 42).fill(color);
    document.font('Helvetica-Bold').fontSize(7).fillColor(color).text(`OBS. ${index}`, MARGIN_X + 12, startY + 8, { width: 46 });
    document.font('Helvetica-Bold').fontSize(8.3).fillColor(NAVY).text(this.asString(finding.title) || condition, MARGIN_X + 60, startY + 7, { width: 270, height: 28, ellipsis: true });
    document.font('Helvetica-Bold').fontSize(6.7).fillColor(color).text(this.severityLabel(this.asString(finding.severity)), MARGIN_X + 338, startY + 8, { width: 72, align: 'center' });
    document.font('Helvetica-Bold').fontSize(6.7).fillColor(color).text(this.statusLabel(this.asString(finding.status)), MARGIN_X + 412, startY + 8, { width: 75, align: 'center' });
    document.y = startY + 50;

    this.drawParagraph(document, 'Condición detectada', condition);
    this.drawParagraph(document, 'Medida correctiva propuesta', proposed);
    if (executed) this.drawParagraph(document, 'Descripción de la acción tomada', executed);
    if (rejected) this.drawParagraph(document, 'Motivo de rechazo', rejected, RED);

    const responsible = this.asString(finding.responsibleCompanyName) || this.asString(finding.ownerUserName) || 'Sin responsable';
    const dueAt = this.formatDate(this.asString(finding.dueAt));
    document.font('Helvetica-Bold').fontSize(6.5).fillColor(MUTED).text(`Responsable: ${responsible}`, MARGIN_X + 8, document.y + 3, { width: 290 });
    document.font('Helvetica-Bold').fontSize(6.5).fillColor(color).text(`SLA: ${dueAt}`, MARGIN_X + 310, document.y, { width: 185, align: 'right' });
    document.moveDown(1.2);

    const evidences = this.asArray(finding.evidences).map((value) => this.asRecord(value));
    if (evidences.length > 0) {
      this.ensureSpace(document, context, 125);
      const before = evidences.find((evidence) => this.resolveEvidenceSlot(evidence) === 'before') ?? evidences[0];
      const after = evidences.find((evidence) => this.resolveEvidenceSlot(evidence) === 'after') ?? evidences.find((evidence) => evidence !== before);
      const gap = 8;
      const width = (CONTENT_WIDTH - gap) / 2;
      const y = document.y;
      this.drawEvidenceCard(document, 'Antes', before, assets.get(this.asString(before?.fileId)), MARGIN_X, y, width, 108, '#D6EEF8');
      this.drawEvidenceCard(document, 'Después', after, assets.get(this.asString(after?.fileId)), MARGIN_X + width + gap, y, width, 108, '#DAFCCB');
      document.y = y + 118;
    }

    document.moveTo(MARGIN_X, document.y).lineTo(MARGIN_X + CONTENT_WIDTH, document.y).strokeColor('#E3E3E3').lineWidth(0.5).stroke();
    document.moveDown(1.1);
  }

  private renderTimeline(
    document: ReportPdfDocument,
    context: ReportContext,
    inspection: UnknownRecord,
    findings: UnknownRecord[],
    comments: UnknownRecord[],
  ) {
    this.ensureSpace(document, context, 120);
    this.sectionTitle(document, 'Historial de seguimiento / follow-up history');
    const events: Array<{ date: string; title: string; detail: string; color: string }> = [];
    events.push({
      date: this.asString(inspection.startedAt) || this.asString(inspection.createdAt),
      title: 'Inspección inicial',
      detail: `${findings.length} observaciones registradas`,
      color: NAVY,
    });
    for (const finding of findings) {
      const label = this.asString(finding.title) || this.asString(finding.detectedCondition) || 'Observación';
      if (this.asString(finding.executedAt)) events.push({ date: this.asString(finding.executedAt), title: 'Observación ejecutada', detail: label, color: TEAL });
      if (this.asString(finding.rejectedAt)) events.push({ date: this.asString(finding.rejectedAt), title: 'Evidencia rechazada', detail: this.asString(finding.rejectionReason) || label, color: RED });
      if (this.asString(finding.closedAt)) events.push({ date: this.asString(finding.closedAt), title: 'Cierre aprobado', detail: label, color: GREEN });
      for (const value of this.asArray(finding.followups)) {
        const followup = this.asRecord(value);
        events.push({
          date: this.asString(followup.performedAt) || this.asString(followup.createdAt),
          title: `Seguimiento ${this.asNumber(followup.sequenceNumber, 0)}`,
          detail: this.asString(followup.description) || 'Seguimiento registrado',
          color: GOLD,
        });
      }
    }
    events.sort((left, right) => this.timestamp(left.date) - this.timestamp(right.date));

    for (const event of events) {
      this.ensureSpace(document, context, 48);
      const y = document.y;
      document.circle(MARGIN_X + 8, y + 8, 5).fill(event.color);
      document.font('Helvetica-Bold').fontSize(7.5).fillColor(NAVY).text(event.title, MARGIN_X + 22, y, { width: 270 });
      document.font('Helvetica').fontSize(6.8).fillColor(MUTED).text(this.formatDateTime(event.date), MARGIN_X + 310, y, { width: 185, align: 'right' });
      document.font('Helvetica').fontSize(7).fillColor(MUTED).text(event.detail, MARGIN_X + 22, y + 15, { width: CONTENT_WIDTH - 30, height: 26, ellipsis: true });
      document.moveTo(MARGIN_X + 8, y + 15).lineTo(MARGIN_X + 8, y + 43).strokeColor('#D1D1D1').lineWidth(0.7).stroke();
      document.y = y + 48;
    }

    if (comments.length > 0) {
      this.sectionTitle(document, 'Notas / comments');
      comments.slice(0, 8).forEach((comment) => {
        this.ensureSpace(document, context, 38);
        document.roundedRect(MARGIN_X, document.y, CONTENT_WIDTH, 30, 4).fill(LIGHT);
        document.font('Helvetica').fontSize(7).fillColor(MUTED).text(this.asString(comment.body) || this.asString(comment.description) || 'Comentario', MARGIN_X + 8, document.y + 8, { width: CONTENT_WIDTH - 16, height: 17, ellipsis: true });
        document.y += 36;
      });
    }

    this.ensureSpace(document, context, 110);
    this.sectionTitle(document, 'Firmas y responsables / signatures');
    const inspector = this.asString(inspection.inspectorName) || 'Inspector';
    const responsible = findings.map((finding) => this.asString(finding.ownerUserName) || this.asString(finding.responsibleCompanyName)).find(Boolean) || 'Responsable de cierre';
    const approver = findings.map((finding) => this.asString(finding.closedByUserName)).find(Boolean) || 'Aprobador GF';
    const width = (CONTENT_WIDTH - 16) / 3;
    [
      ['Inspector', inspector],
      ['Responsable', responsible],
      ['Aprobador', approver],
    ].forEach(([role, name], index) => {
      const x = MARGIN_X + index * (width + 8);
      const y = document.y + 28;
      document.moveTo(x, y).lineTo(x + width, y).strokeColor(NAVY).lineWidth(0.6).stroke();
      document.font('Helvetica-Bold').fontSize(7).fillColor(NAVY).text(name, x, y + 5, { width, align: 'center' });
      document.font('Helvetica').fontSize(6.4).fillColor(MUTED).text(role, x, y + 17, { width, align: 'center' });
    });
    document.y += 62;
  }

  private addPage(document: ReportPdfDocument, context: ReportContext) {
    document.addPage({ size: 'A4', margins: { top: 42, bottom: 42, left: MARGIN_X, right: MARGIN_X } });
    document.font('Helvetica-Bold').fontSize(7.5).fillColor(NAVY).text('AURELIA', MARGIN_X, 26, { width: 70 });
    document.font('Helvetica').fontSize(5.3).fillColor(MUTED).text('Gold Fields Salares Norte', MARGIN_X, 36, { width: 105 });
    document.font('Helvetica-Bold').fontSize(6).fillColor(MUTED).text('INFORME DE INSPECCIÓN / INSPECTION REPORT', 190, 25, { width: 220, align: 'center' });
    document.font('Helvetica-Bold').fontSize(11).fillColor(NAVY).text(`Inspección #${context.inspectionNumber}`, 394, 28, { width: 157, align: 'right' });
    document.moveTo(MARGIN_X, 52).lineTo(MARGIN_X + CONTENT_WIDTH, 52).strokeColor(NAVY).lineWidth(1).stroke();
    document.y = 66;
  }

  private ensureSpace(document: ReportPdfDocument, context: ReportContext, height: number) {
    if (document.y + height <= CONTENT_BOTTOM) return;
    this.addPage(document, context);
  }

  private addFooters(document: ReportPdfDocument, context: ReportContext) {
    const range = document.bufferedPageRange();
    for (let index = range.start; index < range.start + range.count; index += 1) {
      document.switchToPage(index);
      document.moveTo(MARGIN_X, PAGE_HEIGHT - 38).lineTo(MARGIN_X + CONTENT_WIDTH, PAGE_HEIGHT - 38).strokeColor('#D1D1D1').lineWidth(0.5).stroke();
      document.font('Helvetica').fontSize(5.5).fillColor(MUTED).text('Generado por Aurelia ESG · Gold Fields Salares Norte', MARGIN_X, PAGE_HEIGHT - 29, { width: 285 });
      document.font('Helvetica').fontSize(5.5).fillColor(MUTED).text(`Emisión: ${this.formatDateTime(context.generatedAt)} · Confidencial · Uso interno`, 300, PAGE_HEIGHT - 29, { width: 220, align: 'right' });
      document.font('Helvetica-Bold').fontSize(5.5).fillColor(NAVY).text(`${index - range.start + 1} / ${range.count}`, 520, PAGE_HEIGHT - 17, { width: 31, align: 'right' });
    }
  }

  private sectionTitle(document: ReportPdfDocument, title: string, color = GOLD) {
    document.moveDown(0.8);
    this.ensureSpace(document, { inspectionNumber: '', generatedAt: '', title: '' }, 24);
    const y = document.y;
    document.rect(MARGIN_X, y + 1, 3, 12).fill(color);
    document.font('Helvetica-Bold').fontSize(7.2).fillColor(NAVY).text(title.toUpperCase(), MARGIN_X + 9, y + 2, { width: CONTENT_WIDTH - 9 });
    document.y = y + 20;
  }

  private drawMetricRow(document: ReportPdfDocument, metrics: Array<[string, string]>) {
    const gap = 6;
    const width = (CONTENT_WIDTH - gap * (metrics.length - 1)) / metrics.length;
    const y = document.y;
    metrics.forEach(([label, value], index) => {
      const x = MARGIN_X + index * (width + gap);
      document.roundedRect(x, y, width, 44, 4).fillAndStroke(LIGHT, BORDER);
      document.font('Helvetica-Bold').fontSize(5.7).fillColor(MUTED).text(label.toUpperCase(), x + 7, y + 7, { width: width - 14 });
      document.font('Helvetica-Bold').fontSize(11).fillColor(NAVY).text(value, x + 7, y + 19, { width: width - 14, height: 18, ellipsis: true });
    });
    document.y = y + 49;
  }

  private drawKeyValueGrid(document: ReportPdfDocument, rows: Array<[string, string]>) {
    const columns = 2;
    const cellWidth = CONTENT_WIDTH / columns;
    const rowHeight = 27;
    const y = document.y;
    rows.forEach(([label, value], index) => {
      const row = Math.floor(index / columns);
      const column = index % columns;
      const x = MARGIN_X + column * cellWidth;
      const top = y + row * rowHeight;
      document.rect(x, top, cellWidth, rowHeight).fillAndStroke('#FFFFFF', BORDER);
      document.font('Helvetica-Bold').fontSize(5.8).fillColor(MUTED).text(label.toUpperCase(), x + 7, top + 6, { width: 92 });
      document.font('Helvetica-Bold').fontSize(6.8).fillColor(NAVY).text(value, x + 102, top + 6, { width: cellWidth - 110, height: 15, ellipsis: true });
    });
    document.y = y + Math.ceil(rows.length / columns) * rowHeight;
  }

  private drawFindingsSummaryTable(document: ReportPdfDocument, findings: UnknownRecord[]) {
    this.sectionTitle(document, `Resumen de observaciones · ${findings.length}`);
    const widths = [28, 215, 70, 78, 58, 58];
    const headers = ['N°', 'Condición detectada', 'Criticidad', 'Estado', 'SLA', '% cierre'];
    let y = document.y;
    let x = MARGIN_X;
    headers.forEach((header, index) => {
      document.rect(x, y, widths[index], 22).fill(NAVY);
      document.font('Helvetica-Bold').fontSize(5.4).fillColor('#FFFFFF').text(header.toUpperCase(), x + 4, y + 7, { width: widths[index] - 8, align: index === 1 ? 'left' : 'center' });
      x += widths[index];
    });
    y += 22;
    findings.slice(0, 12).forEach((finding, index) => {
      const condition = this.asString(finding.detectedCondition) || this.asString(finding.description) || this.asString(finding.title) || 'Sin descripción';
      const values = [
        String(index + 1),
        condition,
        this.severityLabel(this.asString(finding.severity)),
        this.statusLabel(this.asString(finding.status)),
        this.formatDate(this.asString(finding.dueAt)),
        this.asString(finding.status) === InspectionFindingStatus.CLOSED ? '100%' : '0%',
      ];
      const height = Math.max(24, Math.min(38, document.heightOfString(condition, { width: widths[1] - 8 }) + 10));
      x = MARGIN_X;
      values.forEach((value, cellIndex) => {
        document.rect(x, y, widths[cellIndex], height).fillAndStroke(index % 2 === 0 ? '#FFFFFF' : LIGHT, BORDER);
        document.font(cellIndex === 0 ? 'Helvetica-Bold' : 'Helvetica').fontSize(5.8).fillColor(cellIndex === 0 ? BLUE : '#131313').text(value, x + 4, y + 6, { width: widths[cellIndex] - 8, height: height - 9, ellipsis: true, align: cellIndex === 1 ? 'left' : 'center' });
        x += widths[cellIndex];
      });
      y += height;
    });
    document.y = y;
  }

  private drawParagraph(document: ReportPdfDocument, label: string, value: string, color = NAVY) {
    const y = document.y;
    document.font('Helvetica-Bold').fontSize(5.8).fillColor(color).text(label.toUpperCase(), MARGIN_X + 8, y, { width: CONTENT_WIDTH - 16 });
    document.font('Helvetica').fontSize(7.2).fillColor('#333333').text(value, MARGIN_X + 8, y + 10, { width: CONTENT_WIDTH - 16, height: 42, ellipsis: true });
    document.y = y + Math.min(58, 17 + document.heightOfString(value, { width: CONTENT_WIDTH - 16 }));
  }

  private drawEvidenceCard(
    document: ReportPdfDocument,
    title: string,
    evidence: UnknownRecord | undefined,
    asset: EvidenceAsset | undefined,
    x: number,
    y: number,
    width: number,
    height: number,
    background: string,
  ) {
    document.roundedRect(x, y, width, height, 4).fillAndStroke(background, BORDER);
    document.rect(x, y, width, 18).fill(NAVY);
    document.font('Helvetica-Bold').fontSize(6).fillColor('#FFFFFF').text(title.toUpperCase(), x + 7, y + 6, { width: width - 14 });
    this.drawImage(document, asset, x + 4, y + 22, width - 8, height - 26);
    if (!asset && evidence) {
      document.font('Helvetica').fontSize(6).fillColor(MUTED).text(this.asString(evidence.title) || this.asString(evidence.description) || 'Evidencia registrada', x + 8, y + 50, { width: width - 16, align: 'center' });
    }
  }

  private drawImagePanel(document: ReportPdfDocument, asset: EvidenceAsset | undefined, label: string, width: number, height: number, background: string) {
    const y = document.y;
    document.roundedRect(MARGIN_X, y, width, height, 4).fillAndStroke(background, BORDER);
    this.drawImage(document, asset, MARGIN_X + 4, y + 4, width - 8, height - 8);
    if (!asset) document.font('Helvetica').fontSize(7).fillColor(MUTED).text(label || 'Sin fotografía general', MARGIN_X + 12, y + height / 2 - 4, { width: width - 24, align: 'center' });
    document.y = y + height;
  }

  private drawImage(document: ReportPdfDocument, asset: EvidenceAsset | undefined, x: number, y: number, width: number, height: number) {
    if (!asset) return;
    try {
      document.image(asset.path, x, y, { fit: [width, height], align: 'center', valign: 'center' });
    } catch {
      document.font('Helvetica').fontSize(6).fillColor(MUTED).text('Vista previa no disponible', x, y + height / 2 - 3, { width, align: 'center' });
    }
  }

  private drawEmptyState(document: ReportPdfDocument, text: string) {
    const y = document.y;
    document.roundedRect(MARGIN_X, y, CONTENT_WIDTH, 34, 4).fillAndStroke(LIGHT, BORDER);
    document.font('Helvetica').fontSize(7).fillColor(MUTED).text(text, MARGIN_X + 10, y + 12, { width: CONTENT_WIDTH - 20, align: 'center' });
    document.y = y + 40;
  }

  private async loadEvidenceAssets(payload: Record<string, unknown>): Promise<Map<string, EvidenceAsset>> {
    const evidences = this.collectEvidenceRecords(payload);
    const entries = await Promise.all(evidences.map(async (evidence) => {
      const fileId = this.asString(evidence.fileId);
      if (!fileId) return null;
      try {
        const content = await this.files.getContent(fileId);
        if (content.mimeType && !content.mimeType.startsWith('image/')) return null;
        return [fileId, { path: content.path, mimeType: content.mimeType }] as const;
      } catch {
        return null;
      }
    }));
    return new Map(entries.filter((entry): entry is readonly [string, EvidenceAsset] => Boolean(entry)));
  }

  private collectEvidenceRecords(payload: Record<string, unknown>): UnknownRecord[] {
    const records = new Map<string, UnknownRecord>();
    const visit = (value: unknown) => {
      if (Array.isArray(value)) {
        value.forEach(visit);
        return;
      }
      if (!value || typeof value !== 'object') return;
      const record = value as UnknownRecord;
      const id = this.asString(record.id);
      const fileId = this.asString(record.fileId);
      if (id && fileId) records.set(id, record);
      Object.values(record).forEach(visit);
    };
    visit(payload.evidences);
    visit(payload.findings);
    return Array.from(records.values());
  }

  private findGeneralEvidence(payload: Record<string, unknown>, findings: UnknownRecord[]): UnknownRecord | undefined {
    const root = this.asArray(payload.evidences).map((value) => this.asRecord(value));
    const inspectionEvidence = root.find((evidence) => this.asArray(evidence.links).some((value) => this.asString(this.asRecord(value).entityType) === 'inspection'));
    if (inspectionEvidence) return inspectionEvidence;
    return findings.flatMap((finding) => this.asArray(finding.evidences).map((value) => this.asRecord(value)))[0];
  }

  private resolveEvidenceSlot(evidence: UnknownRecord): 'before' | 'after' | 'other' {
    const links = this.asArray(evidence.links).map((value) => this.asRecord(value));
    const signal = [
      this.asString(evidence.title),
      this.asString(evidence.description),
      this.asString(evidence.evidenceType),
      ...links.map((link) => this.asString(link.relationType)),
    ].join(' ').toLowerCase();
    if (signal.includes('after') || signal.includes('después') || signal.includes('despues') || signal.includes('cierre') || signal.includes('execution')) return 'after';
    if (signal.includes('before') || signal.includes('antes') || signal.includes('inicial') || signal.includes('detect')) return 'before';
    return 'other';
  }

  private severityLabel(value: string): string {
    if (value === 'critical') return 'Crítica';
    if (value === 'high') return 'Grave';
    if (value === 'medium') return 'Moderada';
    if (value === 'low') return 'Menor';
    return value || 'Sin criticidad';
  }

  private statusLabel(value: string): string {
    if (value === InspectionFindingStatus.OPEN || value === 'open') return 'Abierta';
    if (value === InspectionFindingStatus.IN_PROGRESS || value === 'in_progress') return 'Ejecutada';
    if (value === InspectionFindingStatus.CLOSED || value === 'closed') return 'Cerrada';
    if (value === InspectionFindingStatus.REJECTED || value === 'rejected') return 'Rechazada';
    if (value === 'draft') return 'Borrador';
    if (value === 'submitted') return 'Enviada';
    if (value === 'under_review') return 'En revisión';
    return value || 'Sin estado';
  }

  private joinLabel(left: string, right: string): string {
    return [left, right].filter(Boolean).join(' · ') || 'Sin área';
  }

  private joinCoordinates(latitude: unknown, longitude: unknown): string {
    const left = this.asString(latitude);
    const right = this.asString(longitude);
    return left && right ? `${left}, ${right}` : 'Sin ubicación';
  }

  private formatDate(value: string): string {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Santiago' }).format(date);
  }

  private formatDateTime(value: string): string {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Santiago' }).format(date);
  }

  private timestamp(value: string): number {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? Number.MAX_SAFE_INTEGER : date.getTime();
  }

  private resolveNumber(title: string): string {
    return title.match(/#?(\d+)/)?.[1] ?? '—';
  }

  private asRecord(value: unknown): UnknownRecord {
    return value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : {};
  }

  private asArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
  }

  private asString(value: unknown): string {
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number') return String(value);
    return '';
  }

  private asNumber(value: unknown, fallback: number): number {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
}
