import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  InspectionAnswerValue,
  InspectionChecklistAnswerResponse,
  InspectionChecklistSectionResponse,
  InspectionChecklistTemplateResponse,
  InspectionResponse,
  InspectionStatus,
  InspectionType,
  InspectionTypeResponse,
} from '@aurelia/contracts';
import { In, QueryFailedError, Repository } from 'typeorm';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateInspectionDto } from './dto/update-inspection.dto';
import { UpdateInspectionStatusDto } from './dto/update-inspection-status.dto';
import { UpsertInspectionAnswerDto } from './dto/upsert-inspection-answer.dto';
import { InspectionFormItemEntity } from './entities/inspection-form-item.entity';
import { InspectionFormSectionEntity } from './entities/inspection-form-section.entity';
import { InspectionFormTemplateEntity } from './entities/inspection-form-template.entity';
import { InspectionItemResponseEntity } from './entities/inspection-item-response.entity';
import { InspectionStateEntity } from './entities/inspection-state.entity';
import { InspectionTypeEntity } from './entities/inspection-type.entity';
import { InspectionEntity } from './entities/inspection.entity';

interface InspectionListFilters {
  status?: string;
  inspectionTypeId?: string;
}

@Injectable()
export class InspectionsService {
  constructor(
    @InjectRepository(InspectionTypeEntity)
    private readonly inspectionTypes: Repository<InspectionTypeEntity>,
    @InjectRepository(InspectionFormTemplateEntity)
    private readonly templates: Repository<InspectionFormTemplateEntity>,
    @InjectRepository(InspectionFormSectionEntity)
    private readonly sections: Repository<InspectionFormSectionEntity>,
    @InjectRepository(InspectionFormItemEntity)
    private readonly items: Repository<InspectionFormItemEntity>,
    @InjectRepository(InspectionEntity)
    private readonly inspections: Repository<InspectionEntity>,
    @InjectRepository(InspectionItemResponseEntity)
    private readonly answers: Repository<InspectionItemResponseEntity>,
    @InjectRepository(InspectionStateEntity)
    private readonly statusHistory: Repository<InspectionStateEntity>,
  ) {}

  async findTypes(): Promise<InspectionTypeResponse[]> {
    const rows = await this.inspectionTypes.find({ order: { name: 'ASC' } });
    return rows.map((row) => this.toTypeResponse(row));
  }

  async findTemplates(): Promise<InspectionChecklistTemplateResponse[]> {
    const templates = await this.templates.find({ where: { isActive: true }, order: { code: 'ASC' } });
    const templateIds = templates.map((template) => template.id);

    if (templateIds.length === 0) {
      return [];
    }

    const sections = await this.sections.find({
      where: { templateId: In(templateIds), isActive: true },
      order: { sortOrder: 'ASC' },
    });
    const sectionIds = sections.map((section) => section.id);
    const items = sectionIds.length
      ? await this.items.find({
          where: { sectionId: In(sectionIds), isActive: true },
          order: { sortOrder: 'ASC' },
        })
      : [];

    const itemsBySection = new Map<string, InspectionFormItemEntity[]>();
    for (const item of items) {
      const existing = itemsBySection.get(item.sectionId) ?? [];
      existing.push(item);
      itemsBySection.set(item.sectionId, existing);
    }

    const sectionsByTemplate = new Map<string, InspectionChecklistSectionResponse[]>();
    for (const section of sections) {
      const existing = sectionsByTemplate.get(section.templateId) ?? [];
      existing.push({
        id: section.id,
        templateId: section.templateId,
        code: section.code,
        title: section.title,
        description: section.description,
        sortOrder: section.sortOrder,
        isActive: section.isActive,
        createdAt: section.createdAt.toISOString(),
        updatedAt: section.updatedAt.toISOString(),
        items: (itemsBySection.get(section.id) ?? []).map((item) => ({
          id: item.id,
          sectionId: item.sectionId,
          code: item.code,
          question: item.question,
          guidance: item.guidance,
          responseType: item.responseType,
          isRequired: item.isRequired,
          requiresEvidenceOnNotCompliant: item.requiresEvidenceOnNotCompliant,
          sortOrder: item.sortOrder,
          weight: item.weight,
          isActive: item.isActive,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        })),
      });
      sectionsByTemplate.set(section.templateId, existing);
    }

    return templates.map((template) => ({
      id: template.id,
      inspectionTypeId: template.inspectionTypeId,
      code: template.code,
      name: template.name,
      description: template.description,
      version: template.version,
      isActive: template.isActive,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
      sections: sectionsByTemplate.get(template.id) ?? [],
    }));
  }

  async findAll(filters: InspectionListFilters = {}): Promise<InspectionResponse[]> {
    const query = this.inspections.createQueryBuilder('inspection');

    if (filters.status) {
      if (!Object.values(InspectionStatus).includes(filters.status as InspectionStatus)) {
        throw new BadRequestException(`Invalid inspection status '${filters.status}'`);
      }
      query.andWhere('inspection.status = :status', { status: filters.status });
    }

    if (filters.inspectionTypeId) {
      query.andWhere('inspection.inspectionTypeId = :inspectionTypeId', {
        inspectionTypeId: filters.inspectionTypeId,
      });
    }

    const rows = await query.orderBy('inspection.createdAt', 'DESC').getMany();
    return rows.map((row) => this.toInspectionResponse(row));
  }

  async findOne(id: string): Promise<InspectionResponse> {
    return this.toInspectionResponse(await this.getInspectionOrThrow(id));
  }

  async create(dto: CreateInspectionDto, inspectorId: string | null): Promise<InspectionResponse> {
    await this.assertTypeAndTemplate(dto.inspectionTypeId, dto.templateId ?? null);

    const entity = this.inspections.create({
      inspectionTypeId: dto.inspectionTypeId,
      templateId: dto.templateId ?? null,
      companyId: dto.companyId ?? null,
      areaId: dto.areaId ?? null,
      sectorId: dto.sectorId ?? null,
      locationId: dto.locationId ?? null,
      inspectorId,
      title: dto.title,
      description: dto.description ?? null,
      status: InspectionStatus.DRAFT,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
      startedAt: null,
      completedAt: null,
      closedAt: null,
      latitude: this.toNullableNumericString(dto.latitude),
      longitude: this.toNullableNumericString(dto.longitude),
      score: null,
      findingsCount: 0,
      openFindingsCount: 0,
      notes: dto.notes ?? null,
    });

    try {
      const saved = await this.inspections.save(entity);
      await this.createStatusHistory(saved.id, null, saved.status, inspectorId, 'created');
      return this.toInspectionResponse(saved);
    } catch (err) {
      this.rethrowDatabaseReferenceError(err);
    }
  }

  async update(id: string, dto: UpdateInspectionDto, actorId: string | null): Promise<InspectionResponse> {
    const entity = await this.getInspectionOrThrow(id);
    const previousStatus = entity.status;
    const nextTypeId = dto.inspectionTypeId ?? entity.inspectionTypeId;
    const nextTemplateId = dto.templateId === undefined ? entity.templateId : dto.templateId;

    if (dto.inspectionTypeId !== undefined || dto.templateId !== undefined) {
      await this.assertTypeAndTemplate(nextTypeId, nextTemplateId ?? null);
    }

    if (dto.inspectionTypeId !== undefined) entity.inspectionTypeId = dto.inspectionTypeId;
    if (dto.templateId !== undefined) entity.templateId = dto.templateId;
    if (dto.companyId !== undefined) entity.companyId = dto.companyId;
    if (dto.areaId !== undefined) entity.areaId = dto.areaId;
    if (dto.sectorId !== undefined) entity.sectorId = dto.sectorId;
    if (dto.locationId !== undefined) entity.locationId = dto.locationId;
    if (dto.title !== undefined) entity.title = dto.title;
    if (dto.description !== undefined) entity.description = dto.description;
    if (dto.status !== undefined) entity.status = dto.status;
    if (dto.scheduledAt !== undefined) entity.scheduledAt = this.toNullableDate(dto.scheduledAt);
    if (dto.startedAt !== undefined) entity.startedAt = this.toNullableDate(dto.startedAt);
    if (dto.completedAt !== undefined) entity.completedAt = this.toNullableDate(dto.completedAt);
    if (dto.closedAt !== undefined) entity.closedAt = this.toNullableDate(dto.closedAt);
    if (dto.latitude !== undefined) entity.latitude = this.toNullableNumericString(dto.latitude);
    if (dto.longitude !== undefined) entity.longitude = this.toNullableNumericString(dto.longitude);
    if (dto.score !== undefined) entity.score = this.toNullableNumericString(dto.score);
    if (dto.notes !== undefined) entity.notes = dto.notes;

    try {
      const saved = await this.inspections.save(entity);
      if (saved.status !== previousStatus) {
        await this.createStatusHistory(saved.id, previousStatus, saved.status, actorId, dto.reason ?? null);
      }
      return this.toInspectionResponse(saved);
    } catch (err) {
      this.rethrowDatabaseReferenceError(err);
    }
  }

  async updateStatus(
    id: string,
    dto: UpdateInspectionStatusDto,
    actorId: string | null,
  ): Promise<InspectionResponse> {
    return this.update(id, { status: dto.status, reason: dto.comment ?? null }, actorId);
  }

  async upsertAnswer(
    inspectionId: string,
    dto: UpsertInspectionAnswerDto,
    actorId: string | null,
  ): Promise<InspectionChecklistAnswerResponse> {
    const inspection = await this.getInspectionOrThrow(inspectionId);
    const item = await this.items.findOneBy({ id: dto.checklistItemId });

    if (!item) {
      throw new NotFoundException(`Checklist item ${dto.checklistItemId} not found`);
    }

    if (inspection.templateId) {
      const section = await this.sections.findOneBy({ id: item.sectionId });
      if (!section || section.templateId !== inspection.templateId) {
        throw new BadRequestException('Checklist item does not belong to the inspection template');
      }
    }

    const existing = await this.answers.findOneBy({ inspectionId, checklistItemId: dto.checklistItemId });
    const answer = existing ?? this.answers.create({ inspectionId, checklistItemId: dto.checklistItemId });

    answer.answerValue = dto.answerValue ?? null;
    answer.answerText = dto.answerText ?? null;
    answer.numericValue = this.toNullableNumericString(dto.numericValue);
    answer.answeredByUserId = actorId;
    answer.answeredAt = dto.answeredAt ? new Date(dto.answeredAt) : new Date();
    answer.notes = dto.notes ?? null;

    try {
      return this.toAnswerResponse(await this.answers.save(answer));
    } catch (err) {
      this.rethrowDatabaseReferenceError(err);
    }
  }

  private async getInspectionOrThrow(id: string): Promise<InspectionEntity> {
    const inspection = await this.inspections.findOneBy({ id });
    if (!inspection) {
      throw new NotFoundException(`Inspection ${id} not found`);
    }
    return inspection;
  }

  private async assertTypeAndTemplate(inspectionTypeId: string, templateId: string | null): Promise<void> {
    const type = await this.inspectionTypes.findOneBy({ id: inspectionTypeId });
    if (!type) {
      throw new NotFoundException(`Inspection type ${inspectionTypeId} not found`);
    }

    if (!templateId) {
      return;
    }

    const template = await this.templates.findOneBy({ id: templateId });
    if (!template) {
      throw new NotFoundException(`Inspection template ${templateId} not found`);
    }

    if (template.inspectionTypeId !== inspectionTypeId) {
      throw new BadRequestException('Inspection template does not belong to the selected inspection type');
    }
  }

  private async createStatusHistory(
    inspectionId: string,
    fromStatus: InspectionStatus | null,
    toStatus: InspectionStatus,
    actorId: string | null,
    reason: string | null,
  ): Promise<void> {
    await this.statusHistory.save(
      this.statusHistory.create({
        inspectionId,
        previousStatus: fromStatus,
        nextStatus: toStatus,
        changedByUserId: actorId,
        reason,
        metadata: null,
      }),
    );
  }

  private toTypeResponse(entity: InspectionTypeEntity): InspectionTypeResponse {
    return {
      id: entity.id,
      code: entity.code as InspectionType,
      name: entity.name,
      description: entity.description,
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  private toInspectionResponse(entity: InspectionEntity): InspectionResponse {
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

  private toAnswerResponse(entity: InspectionItemResponseEntity): InspectionChecklistAnswerResponse {
    return {
      id: entity.id,
      inspectionId: entity.inspectionId,
      checklistItemId: entity.checklistItemId,
      answerValue: entity.answerValue as InspectionAnswerValue | null,
      answerText: entity.answerText,
      numericValue: entity.numericValue,
      answeredByUserId: entity.answeredByUserId,
      answeredAt: this.toNullableIsoString(entity.answeredAt),
      notes: entity.notes,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  private toNullableIsoString(value: Date | null): string | null {
    return value ? value.toISOString() : null;
  }

  private toNullableDate(value: string | null): Date | null {
    return value ? new Date(value) : null;
  }

  private toNullableNumericString(value: number | null | undefined): string | null {
    return value === null || value === undefined ? null : String(value);
  }

  private rethrowDatabaseReferenceError(err: unknown): never {
    if (err instanceof QueryFailedError) {
      const code = (err as QueryFailedError & { code?: string }).code;
      if (code === '23503') {
        throw new BadRequestException('Referenced entity does not exist');
      }
    }
    throw err as Error;
  }
}
