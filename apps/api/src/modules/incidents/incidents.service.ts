import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncidentResponse, IncidentStatus } from '@aurelia/contracts';
import { IncidentEntity } from './entities/incident.entity';
import { CreateIncidentDto } from './dto/create-incident.dto';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(IncidentEntity)
    private readonly incidents: Repository<IncidentEntity>,
  ) {}

  async findAll(): Promise<IncidentResponse[]> {
    const rows = await this.incidents.find({ order: { reportedAt: 'DESC' } });
    return rows.map((row) => this.toResponse(row));
  }

  async create(dto: CreateIncidentDto): Promise<IncidentResponse> {
    const reportedAt = dto.reportedAt ? new Date(dto.reportedAt) : new Date();
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
      occurredAt: new Date(dto.occurredAt),
      reportedAt,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      immediateResponseSummary: dto.immediateResponseSummary ?? null,
      environmentalImpactSummary: dto.environmentalImpactSummary ?? null,
      slaDueAt: null,
      closedAt: null,
      closedByUserId: null,
    });
    const saved = await this.incidents.save(entity);
    return this.toResponse(saved);
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
}
