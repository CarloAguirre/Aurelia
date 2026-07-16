import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { FilesService } from '../files/files.service';
import { InspectionDetailReportPdfPixelPerfectService } from './inspection-detail-report-pdf-pixel-perfect.service';
import { ReportPdfService } from './report-pdf.service';

type UnknownRecord = Record<string, unknown>;

@Injectable()
export class InspectionDetailReportPdfTranslatedService extends InspectionDetailReportPdfPixelPerfectService {
  constructor(
    pdf: ReportPdfService,
    files: FilesService,
    private readonly aiService: AiService,
  ) {
    super(pdf, files);
  }

  override async render(payload: Record<string, unknown>): Promise<Buffer> {
    const findings = this.reportArray(payload.findings).map((value) => this.reportRecord(value));
    if (findings.length === 0) return super.render(payload);

    const pendingIndexes: number[] = [];
    const pendingSources: string[] = [];

    findings.forEach((finding, index) => {
      if (this.explicitEnglish(finding)) return;
      const source = this.sourceCondition(finding);
      if (!source) return;
      pendingIndexes.push(index);
      pendingSources.push(source);
    });

    const generatedTranslations = await this.aiService.translateToEnglish(pendingSources);
    const translationsByIndex = new Map<number, string>();
    pendingIndexes.forEach((findingIndex, translationIndex) => {
      const translation = generatedTranslations[translationIndex]?.trim() ?? '';
      if (translation) translationsByIndex.set(findingIndex, translation);
    });

    const translatedFindings = findings.map((finding, index) => {
      const translation = this.explicitEnglish(finding) || translationsByIndex.get(index) || '';
      if (!translation) return finding;
      return {
        ...finding,
        titleEn: translation,
        detectedConditionEn: translation,
        reportSummaryConditionEn: translation,
      };
    });

    return super.render({
      ...payload,
      findings: translatedFindings,
    });
  }

  private sourceCondition(finding: UnknownRecord): string {
    return this.reportString(finding.detectedCondition)
      || this.reportString(finding.title);
  }

  private explicitEnglish(finding: UnknownRecord): string {
    return this.reportString(finding.detectedConditionEn)
      || this.reportString(finding.titleEn)
      || this.reportString(finding.descriptionEn);
  }

  private reportArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
  }

  private reportRecord(value: unknown): UnknownRecord {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? value as UnknownRecord
      : {};
  }

  private reportString(value: unknown): string {
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number') return String(value);
    return '';
  }
}
