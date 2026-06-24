import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentResponse, EvidenceLinkResponse, EvidenceResponse, InspectionFindingStatus, InspectionStatus } from '@aurelia/contracts';
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
