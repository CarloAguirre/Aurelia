import { Injectable } from '@nestjs/common';
import { FilesService } from '../files/files.service';
import { InspectionDetailReportPdfRuntimeService } from './inspection-detail-report-pdf-runtime.service';
import { ReportPdfService } from './report-pdf.service';

type UnknownRecord = Record<string, unknown>;

type Runtime = {
  slaLabel: (finding: UnknownRecord) => string;
};

@Injectable()
export class InspectionDetailReportPdfFinalService extends InspectionDetailReportPdfRuntimeService {
  constructor(pdf: ReportPdfService, files: FilesService) {
    super(pdf, files);
  }

  override async render(payload: Record<string, unknown>): Promise<Buffer> {
    const generatedAt = this.stringValue(payload.generatedAt) || new Date().toISOString();
    const runtime = this as unknown as Runtime;
    runtime.slaLabel = (finding) => this.detailedSlaLabel(finding);

    return super.render({
      ...payload,
      generatedAt,
      findings: this.arrayValue(payload.findings).map((value) => this.prepareFinding(this.recordValue(value), generatedAt)),
    });
  }

  private prepareFinding(finding: UnknownRecord, generatedAt: string): UnknownRecord {
    const detectedCondition = this.stringValue(finding.detectedCondition);
    const description = this.stringValue(finding.description);
    const originalTitle = this.stringValue(finding.title);
    const primaryTitle = detectedCondition || originalTitle || description || 'Observación';
    const translatedTitle = this.stringValue(finding.detectedConditionEn)
      || this.stringValue(finding.descriptionEn)
      || this.stringValue(finding.titleEn)
      || (description && description !== primaryTitle ? description : '');

    return {
      ...finding,
      title: primaryTitle,
      titleEn: translatedTitle,
      detectedCondition: detectedCondition || primaryTitle,
      detectedConditionEn: translatedTitle,
      reportGeneratedAt: generatedAt,
    };
  }

  private detailedSlaLabel(finding: UnknownRecord): string {
    const dueAt = this.dateValue(finding.dueAt);
    if (!dueAt) return 'Sin SLA registrado / No SLA registered';

    const reference = this.dateValue(finding.closedAt)
      || this.dateValue(finding.reportGeneratedAt)
      || new Date();
    const overdue = reference.getTime() > dueAt.getTime();
    const elapsedDays = this.businessDaysBetween(overdue ? dueAt : reference, overdue ? reference : dueAt);
    const totalDays = this.resolveAllocatedBusinessDays(finding, dueAt);
    const currentEs = overdue
      ? `Vencido hace ${elapsedDays} ${elapsedDays === 1 ? 'día' : 'días'}`
      : `${elapsedDays} ${elapsedDays === 1 ? 'día restante' : 'días restantes'}`;
    const currentEn = overdue
      ? `Overdue by ${elapsedDays} ${elapsedDays === 1 ? 'day' : 'days'}`
      : `${elapsedDays} ${elapsedDays === 1 ? 'day remaining' : 'days remaining'}`;
    const allocation = totalDays > 0
      ? ` (SLA: ${totalDays} ${totalDays === 1 ? 'día hábil' : 'días hábiles'} / ${totalDays} business ${totalDays === 1 ? 'day' : 'days'})`
      : '';

    return `${currentEs} / ${currentEn}${allocation}`;
  }

  private resolveAllocatedBusinessDays(finding: UnknownRecord, dueAt: Date): number {
    const explicit = [finding.slaBusinessDays, finding.slaDays, finding.severitySlaDays]
      .map((value) => this.numberValue(value))
      .find((value) => value > 0);
    if (explicit) return explicit;

    const severityCatalog = this.recordValue(finding.severityCatalog);
    const label = this.stringValue(severityCatalog.closureTimeLabel)
      || this.stringValue(finding.severityClosureTimeLabel);
    const labelDays = Number(label.match(/\d+/)?.[0] ?? 0);
    if (labelDays > 0) return labelDays;

    const createdAt = this.dateValue(finding.createdAt);
    return createdAt ? this.businessDaysBetween(createdAt, dueAt) : 0;
  }

  private businessDaysBetween(start: Date, end: Date): number {
    const from = this.utcDate(start);
    const to = this.utcDate(end);
    if (from.getTime() >= to.getTime()) return 0;

    let days = 0;
    const cursor = new Date(from);
    while (cursor.getTime() < to.getTime()) {
      cursor.setUTCDate(cursor.getUTCDate() + 1);
      const weekday = cursor.getUTCDay();
      if (weekday !== 0 && weekday !== 6) days += 1;
    }
    return days;
  }

  private utcDate(value: Date): Date {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }

  private dateValue(value: unknown): Date | null {
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
    if (typeof value !== 'string' || !value.trim()) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private stringValue(value: unknown): string {
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number') return String(value);
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
    return '';
  }

  private numberValue(value: unknown): number {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private arrayValue(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
  }

  private recordValue(value: unknown): UnknownRecord {
    return value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : {};
  }
}
