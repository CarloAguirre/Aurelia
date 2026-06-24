import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentResponse, EvidenceLinkResponse, EvidenceResponse, InspectionFindingStatus } from '@aurelia/contracts';
import { In, Repository } from 'typeorm';
import { AuditService } from '../audit/audit.service';
import { CommentsService } from '../comments/comments.service';
import { EvidencesService } from '../evidences/evidences.service';
import { CreateInspectionCommentDto } from './dto/create-inspection-comment.dto';
import { LinkInspectionEvidenceDto } from './dto/link-inspection-evidence.dto';
import { InspectionFindingEntity } from './entities/inspection-finding.entity';
import { InspectionFollowupEntity } from './entities/inspection-followup.entity';
import { InspectionFormItemEntity } from './entities/inspection-form-item.entity';
import { InspectionFormSectionEntity } from './entities/inspection-form-section.entity';
import { InspectionFormTemplateEntity } from './entities/inspection-form-template.entity';
import { InspectionItemResponseEntity } from './entities/inspection-item-response.entity';
import { InspectionEntity } from './entities/inspection.entity';

@Injectable()
export class InspectionTransversalService {
  constructor(
    @InjectRepository(InspectionEntity)
    private readonly inspections: Repository<InspectionEntity>,
    @InjectRepository(InspectionFormTemplateEntity)
    private readonly templates: Repository<InspectionFormTemplateEntity>,
    @InjectRepository(InspectionFormSectionEntity)
    private readonly sections: Repository<InspectionFormSectionEntity>,
    @InjectRepository(InspectionFormItemEntity)
    private readonly items: Repository<InspectionFormItemEntity>,
    @InjectRepository(InspectionItemResponseEntity)
    private readonly answers: Repository<InspectionItemResponseEntity>,
    @InjectRepository(InspectionFindingEntity)
    private readonly findings: Repository<InspectionFindingEntity>,
    @InjectRepository(InspectionFollowupEntity)
    private readonly followups: Repository<InspectionFollowupEntity>,
    private readonly evidencesService: EvidencesService,
    private readonly commentsService: CommentsService,
    private readonly auditService: AuditService,
  ) {}

  async findEvidences(inspectionId: string): Promise<EvidenceResponse[]> {
    await this.getInspectionOrThrow(inspectionId);
    return this.evidencesService.findAll('inspection', inspectionId);
  }

  async linkEvidence(inspectionId: string, evidenceId: string, dto: LinkInspectionEvidenceDto, actorId: string | null): Promise<EvidenceLinkResponse> {
    await this.getInspectionOrThrow(inspectionId);
    const result = await this.evidencesService.link(evidenceId, {
      entityType: 'inspection',
      entityId: inspectionId,
      relationType: dto.relationType ?? 'inspection_evidence',
    });
    await this.logAudit('inspection.evidence.linked', 'inspection', inspectionId, actorId, undefined, { evidenceId, relationType: result.relationType });
    return result;
  }

  async findComments(inspectionId: string): Promise<CommentResponse[]> {
    await this.getInspectionOrThrow(inspectionId);
    return this.commentsService.findAll('inspection', inspectionId);
  }

  async createComment(inspectionId: string, dto: CreateInspectionCommentDto, actorId: string | null): Promise<CommentResponse> {
    await this.getInspectionOrThrow(inspectionId);
    const result = await this.commentsService.create({
      entityType: 'inspection',
      entityId: inspectionId,
      body: dto.body,
      isInternal: dto.isInternal,
      authorUserId: dto.authorUserId ?? actorId ?? undefined,
    });
    await this.logAudit('inspection.comment.created', 'inspection', inspectionId, actorId, undefined, { commentId: result.id, isInternal: result.isInternal });
    return result;
  }

  async getExportPayload(inspectionId: string): Promise<Record<string, unknown>> {
    const inspection = await this.getInspectionOrThrow(inspectionId);
    const template = inspection.templateId ? await this.templates.findOneBy({ id: inspection.templateId }) : null;
    const sections = template
      ? await this.sections.find({ where: { templateId: template.id }, order: { sortOrder: 'ASC' } })
      : [];
    const sectionIds = sections.map((section) => section.id);
    const items = sectionIds.length
      ? await this.items.find({ where: { sectionId: In(sectionIds) }, order: { sortOrder: 'ASC' } })
      : [];
    const answers = await this.answers.find({ where: { inspectionId }, order: { createdAt: 'ASC' } });
    const findings = await this.findings.find({ where: { inspectionId }, order: { createdAt: 'ASC' } });
    const findingIds = findings.map((finding) => finding.id);
    const followups = findingIds.length
      ? await this.followups.find({ where: { findingId: In(findingIds) }, order: { sequenceNumber: 'ASC' } })
      : [];
    const evidences = await this.evidencesService.findAll('inspection', inspectionId);
    const comments = await this.commentsService.findAll('inspection', inspectionId);

    return {
      generatedAt: new Date().toISOString(),
      inspection: this.toInspectionExport(inspection),
      checklist: {
        template,
        sections: sections.map((section) => ({
          ...section,
          items: items.filter((item) => item.sectionId === section.id),
        })),
      },
      answers,
      findings: findings.map((finding) => ({
        ...finding,
        followups: followups.filter((followup) => followup.findingId === finding.id),
      })),
      evidences,
      comments,
      summary: {
        answersCount: answers.length,
        findingsCount: findings.length,
        openFindingsCount: findings.filter((finding) => [InspectionFindingStatus.OPEN, InspectionFindingStatus.IN_PROGRESS].includes(finding.status)).length,
        evidencesCount: evidences.length,
        commentsCount: comments.length,
      },
    };
  }

  async getExportPdf(inspectionId: string): Promise<Buffer> {
    const payload = await this.getExportPayload(inspectionId);
    const inspection = payload.inspection as Record<string, unknown>;
    const summary = payload.summary as Record<string, unknown>;
    const lines = [
      'Aurelia - Reporte de inspeccion',
      `Generado: ${String(payload.generatedAt)}`,
      `ID: ${String(inspection.id)}`,
      `Titulo: ${String(inspection.title)}`,
      `Estado: ${String(inspection.status)}`,
      `Programada: ${String(inspection.scheduledAt ?? 'N/A')}`,
      `Inicio: ${String(inspection.startedAt ?? 'N/A')}`,
      `Cierre: ${String(inspection.closedAt ?? 'N/A')}`,
      `Hallazgos: ${String(summary.findingsCount ?? 0)}`,
      `Hallazgos abiertos: ${String(summary.openFindingsCount ?? 0)}`,
      `Evidencias: ${String(summary.evidencesCount ?? 0)}`,
      `Comentarios: ${String(summary.commentsCount ?? 0)}`,
      '',
      'Este PDF es una salida operativa base. El formato visual avanzado queda para frontend/reporting.',
    ];

    return this.createSimplePdf(lines);
  }

  private async getInspectionOrThrow(id: string): Promise<InspectionEntity> {
    const inspection = await this.inspections.findOneBy({ id });
    if (!inspection) throw new NotFoundException(`Inspection ${id} not found`);
    return inspection;
  }

  private toInspectionExport(entity: InspectionEntity): Record<string, unknown> {
    return {
      id: entity.id,
      inspectionTypeId: entity.inspectionTypeId,
      templateId: entity.templateId,
      companyId: entity.companyId,
      areaId: entity.areaId,
      sectorId: entity.sectorId,
      locationId: entity.locationId,
      inspectorId: entity.inspectorId,
      title: entity.title,
      description: entity.description,
      status: entity.status,
      scheduledAt: this.toNullableIsoString(entity.scheduledAt),
      startedAt: this.toNullableIsoString(entity.startedAt),
      completedAt: this.toNullableIsoString(entity.completedAt),
      closedAt: this.toNullableIsoString(entity.closedAt),
      latitude: entity.latitude,
      longitude: entity.longitude,
      score: entity.score,
      findingsCount: entity.findingsCount,
      openFindingsCount: entity.openFindingsCount,
      notes: entity.notes,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  private createSimplePdf(lines: string[]): Buffer {
    const normalizedLines = lines.flatMap((line) => this.wrapLine(line, 88)).slice(0, 44);
    const content = ['BT', '/F1 11 Tf', '14 TL', '50 780 Td', ...normalizedLines.flatMap((line) => [`(${this.escapePdfText(line)}) Tj`, 'T*']), 'ET'].join('\n');
    const objects = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
      `<< /Length ${Buffer.byteLength(content, 'utf8')} >>\nstream\n${content}\nendstream`,
    ];
    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    for (let index = 0; index < objects.length; index += 1) {
      offsets.push(Buffer.byteLength(pdf, 'utf8'));
      pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
    }
    const xrefOffset = Buffer.byteLength(pdf, 'utf8');
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `).join('\n');
    pdf += `\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
    return Buffer.from(pdf, 'utf8');
  }

  private wrapLine(value: string, maxLength: number): string[] {
    if (value.length <= maxLength) return [value];
    const chunks: string[] = [];
    for (let index = 0; index < value.length; index += maxLength) chunks.push(value.slice(index, index + maxLength));
    return chunks;
  }

  private escapePdfText(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }

  private async logAudit(
    action: string,
    entityType: string,
    entityId: string,
    actorId: string | null,
    oldValue?: Record<string, unknown>,
    newValue?: Record<string, unknown>,
  ): Promise<void> {
    await this.auditService.log({
      action,
      entityType,
      entityId,
      actorUserId: actorId ?? undefined,
      oldValue,
      newValue,
    });
  }

  private toNullableIsoString(value: Date | null): string | null {
    return value ? value.toISOString() : null;
  }
}
