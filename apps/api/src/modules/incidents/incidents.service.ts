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
    const rows = await this.incidents.find();
    return rows.map((row) => this.toResponse(row));
  }

  async create(dto: CreateIncidentDto, reportedById: string): Promise<IncidentResponse> {
    const entity = this.incidents.create({
      title: dto.title,
      description: dto.description,
      type: dto.type,
      riskLevel: dto.riskLevel,
      status: IncidentStatus.REPORTED,
      areaId: dto.areaId,
      mueId: dto.mueId,
      reportedById,
      occurredAt: new Date(dto.occurredAt),
    });
    const saved = await this.incidents.save(entity);
    return this.toResponse(saved);
  }

  private toResponse(entity: IncidentEntity): IncidentResponse {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      type: entity.type,
      riskLevel: entity.riskLevel,
      status: entity.status,
      areaId: entity.areaId,
      mueId: entity.mueId,
      reportedById: entity.reportedById,
      occurredAt: entity.occurredAt.toISOString(),
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
