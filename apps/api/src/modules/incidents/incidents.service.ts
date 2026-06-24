import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import {
  IncidentFlashReportResponse,
  IncidentLevelResponse,
  IncidentResponse,
  IncidentStatus,
  IncidentTypeResponse,
} from '@aurelia/contracts';
import { IncidentFlashReportEntity } from './entities/incident-flash-report.entity';
import { IncidentLevelEntity } from './entities/incident-level.entity';
import { IncidentStatusHistoryEntity } from './entities/incident-status-history.entity';
import { IncidentTypeEntity } from './entities/incident-type.entity';
import { IncidentEntity } from './entities/incident.entity';
import { CreateIncidentFlashReportDto } from './dto/create-incident-flash-report.dto';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { UpdateIncidentStatusDto } from './dto/update-incident-status.dto';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(IncidentEntity)
    private readonly incidents: Repository<IncidentEntity>,
    @InjectRepository(IncidentTypeEntity)
    private readonly incidentTypes: Repository<IncidentTypeEntity>,
    @InjectRepository(IncidentLevelEntity)
    private readonly incidentLevels: Repository<IncidentLevelEntity>,
    @InjectRepository(IncidentFlashReportEntity)
    private readonly flashReports: Repository<IncidentFlashReportEntity>,
    @InjectRepository(IncidentStatusHistoryEntity)
    private readonly statusHistory: Repository<IncidentStatusHistoryEntity>,
  ) {}

  async findTypes(): Promise<IncidentTypeResponse[]> {
    const rows = await this.incidentTypes.find({ order: { name: 'ASC' } });
    return rows.map((row) => this.toTypeResponse(row));
  }

  async findLevels(): Promise<IncidentLevelResponse[]> {
    const rows = await this.incidentLevels.find({ order: { levelNumber: 'ASC' } });
    return rows.map((row) => this.toLevelResponse(row));
  }

  async findAll(filters: {
    status?: string;
    incidentTypeId?: string;
    incidentLevelId?: string;
  } = {}): Promise<IncidentResponse[]> {
    const where: FindOptionsWhere<IncidentEntity> = {};
    if (filters.status) where.status = filters.status as IncidentStatus;
    if (filters.incidentTypeId) where.incidentTypeId = filters.incidentTypeId;
    if (filters.incidentLevelId) where.incidentLevelId = filters.incidentLevelId;

    const rows = await this.incidents.find({ where, order: { reportedAt: 'DESC' } });
    return rows.map((row) => this.toResponse(row));
  }

  async findOne(id: string): Promise<IncidentResponse> {
    const entity = await this.getIncidentOrFail(id);
    return this.toResponse(entity);
  }

  async create(dto: CreateIncidentDto): Promise<IncidentResponse> {
    await this.getTypeOrFail(dto.incidentTypeId);
    const level = await this.getLevelOrFail(dto.incidentLevelId);
    const reportedAt = dto.reportedAt ? new Date(dto.reportedAt) : new Date();
    const occurredAt = new Date(dto.occurredAt);
    const entity = this.incidents.create({
      incidentTypeId: dto.incidentTypeId,
      incidentLevelId: dto.incidentLevelId,
      companyId: dto.companyId ?? null,
      areaId: dto.areaId ?? null,
      sectorId: dto.sectorId ?? null,
      locationId: dto.locationId ?? null,
      reportedByUserId: dto.reportedByUserId ?? null,
      title: dto.title,
      description: dto.description,
      status: IncidentStatus.REPORTED,
      occurredAt,
      reportedAt,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      immediateResponseSummary: dto.immediateResponseSummary ?? null,
      environmentalImpactSummary: dto.environmentalImpactSummary ?? null,
      slaDueAt: this.calculateSlaDueAt(occurredAt, level.slaHours),
      closedAt: null,
      closedByUserId: null,
    });
    const saved = await this.incidents.save(entity);
    await this.appendStatusHistory(saved.id, null, saved.status, saved.reportedByUserId, 'Incident reported', {
      source: 'incident.create',
    });
    return this.toResponse(saved);
  }

  async update(id: string, dto: UpdateIncidentDto): Promise<IncidentResponse> {
    const entity = await this.getIncidentOrFail(id);
    const shouldRecalculateSla = dto.incidentLevelId !== undefined || dto.occurredAt !== undefined;

    if (dto.incidentTypeId !== undefined) {
      await this.getTypeOrFail(dto.incidentTypeId);
      entity.incidentTypeId = dto.incidentTypeId;
    }
    if (dto.incidentLevelId !== undefined) {
      await this.getLevelOrFail(dto.incidentLevelId);
      entity.incidentLevelId = dto.incidentLevelId;
    }
    if (dto.companyId !== undefined) entity.companyId = dto.companyId;
    if (dto.areaId !== undefined) entity.areaId = dto.areaId;
    if (dto.sectorId !== undefined) entity.sectorId = dto.sectorId;
    if (dto.locationId !== undefined) entity.locationId = dto.locationId;
    if (dto.reportedByUserId !== undefined) entity.reportedByUserId = dto.reportedByUserId;
    if (dto.title !== undefined) entity.title = dto.title;
    if (dto.description !== undefined) entity.description = dto.description;
    if (dto.occurredAt !== undefined) entity.occurredAt = new Date(dto.occurredAt);
    if (dto.reportedAt !== undefined) entity.reportedAt = dto.reportedAt ? new Date(dto.reportedAt) : new Date();
    if (dto.latitude !== undefined) entity.latitude = dto.latitude;
    if (dto.longitude !== undefined) entity.longitude = dto.longitude;
    if (dto.immediateResponseSummary !== undefined) {
      entity.immediateResponseSummary = dto.immediateResponseSummary;
    }
    if (dto.environmentalImpactSummary !== undefined) {
      entity.environmentalImpactSummary = dto.environmentalImpactSummary;
    }
    if (shouldRecalculateSla) {
      const level = await this.getLevelOrFail(entity.incidentLevelId);
      entity.slaDueAt = this.calculateSlaDueAt(entity.occurredAt, level.slaHours);
    }

    const saved = await this.incidents.save(entity);
    return this.toResponse(saved);
  }

  async updateStatus(id: string, dto: UpdateIncidentStatusDto): Promise<IncidentResponse> {
    const entity = await this.getIncidentOrFail(id);
    const previousStatus = entity.status;
    entity.status = dto.status;

    if (dto.status === IncidentStatus.CLOSED) {
      entity.closedAt = new Date();
      entity.closedByUserId = dto.changedByUserId ?? null;
    }

    const saved = await this.incidents.save(entity);
    if (previousStatus !== saved.status) {
      await this.appendStatusHistory(saved.id, previousStatus, saved.status, dto.changedByUserId ?? null, dto.comment ?? null, {
        source: 'incident.status.update',
      });
    }
    return this.toResponse(saved);
  }

  async upsertFlashReport(id: string, dto: CreateIncidentFlashReportDto): Promise<IncidentFlashReportResponse> {
    await this.getIncidentOrFail(id);
    const existing = await this.flashReports.findOne({ where: { incidentId: id } });
    const entity = existing ?? this.flashReports.create({ incidentId: id });

    entity.summary = dto.summary;
    entity.immediateCauses = dto.immediateCauses ?? null;
    entity.affectedComponents = dto.affectedComponents ?? null;
    entity.potentialImpact = dto.potentialImpact ?? null;
    entity.reporterName = dto.reporterName ?? null;
    entity.generatedAt = new Date();

    const saved = await this.flashReports.save(entity);
    return this.toFlashReportResponse(saved);
  }

  async findFlashReport(id: string): Promise<IncidentFlashReportResponse> {
    await this.getIncidentOrFail(id);
    const entity = await this.flashReports.findOne({ where: { incidentId: id } });
    if (!entity) throw new NotFoundException('Incident flash report not found');
    return this.toFlashReportResponse(entity);
  }

  private async getIncidentOrFail(id: string): Promise<IncidentEntity> {
    const entity = await this.incidents.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Incident not found');
    return entity;
  }

  private async getTypeOrFail(id: string): Promise<IncidentTypeEntity> {
    const type = await this.incidentTypes.findOne({ where: { id } });
    if (!type) throw new NotFoundException('Incident type not found');
    return type;
  }

  private async getLevelOrFail(id: string): Promise<IncidentLevelEntity> {
    const level = await this.incidentLevels.findOne({ where: { id } });
    if (!level) throw new NotFoundException('Incident level not found');
    return level;
  }

  private calculateSlaDueAt(baseDate: Date, slaHours: number): Date {
    return new Date(baseDate.getTime() + slaHours * 60 * 60 * 1000);
  }

  private async appendStatusHistory(
    incidentId: string,
    fromStatus: IncidentStatus | null,
    toStatus: IncidentStatus,
    changedByUserId: string | null,
    reason: string | null,
    metadata: Record<string, unknown> | null,
  ): Promise<void> {
    await this.statusHistory.save(
      this.statusHistory.create({
        incidentId,
        fromStatus,
        toStatus,
        changedByUserId,
        reason,
        metadata,
      }),
    );
  }

  private toTypeResponse(entity: IncidentTypeEntity): IncidentTypeResponse {
    return {
      id: entity.id,
      code: entity.code,
      name: entity.name,
      description: entity.description,
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  private toLevelResponse(entity: IncidentLevelEntity): IncidentLevelResponse {
    return {
      id: entity.id,
      code: entity.code,
      levelNumber: entity.levelNumber,
      name: entity.name,
      slaHours: entity.slaHours,
      requiresInvestigation: entity.requiresInvestigation,
      description: entity.description,
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  private toResponse(entity: IncidentEntity): IncidentResponse {
    return {
      id: entity.id,
      incidentTypeId: entity.incidentTypeId,
      incidentLevelId: entity.incidentLevelId,
      companyId: entity.companyId,
      areaId: entity.areaId,
      sectorId: entity.sectorId,
      locationId: entity.locationId,
      reportedByUserId: entity.reportedByUserId,
      title: entity.title,
      description: entity.description,
      status: entity.status,
      occurredAt: entity.occurredAt.toISOString(),
      reportedAt: entity.reportedAt.toISOString(),
      latitude: entity.latitude,
      longitude: entity.longitude,
      immediateResponseSummary: entity.immediateResponseSummary,
      environmentalImpactSummary: entity.environmentalImpactSummary,
      slaDueAt: entity.slaDueAt?.toISOString() ?? null,
      closedAt: entity.closedAt?.toISOString() ?? null,
      closedByUserId: entity.closedByUserId,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  private toFlashReportResponse(entity: IncidentFlashReportEntity): IncidentFlashReportResponse {
    return {
      id: entity.id,
      incidentId: entity.incidentId,
      summary: entity.summary,
      immediateCauses: entity.immediateCauses,
      affectedComponents: entity.affectedComponents,
      potentialImpact: entity.potentialImpact,
      reporterName: entity.reporterName,
      generatedAt: entity.generatedAt?.toISOString() ?? null,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
