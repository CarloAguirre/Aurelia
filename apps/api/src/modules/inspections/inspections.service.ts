import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InspectionResponse, InspectionStatus } from '@aurelia/contracts';
import { InspectionEntity } from './entities/inspection.entity';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateInspectionStatusDto } from './dto/update-inspection-status.dto';

@Injectable()
export class InspectionsService {
  constructor(
    @InjectRepository(InspectionEntity)
    private readonly inspections: Repository<InspectionEntity>,
  ) {}

  async findAll(): Promise<InspectionResponse[]> {
    const rows = await this.inspections.find();
    return rows.map((row) => this.toResponse(row));
  }

  async create(dto: CreateInspectionDto, inspectorId: string): Promise<InspectionResponse> {
    const entity = this.inspections.create({
      title: dto.title,
      type: dto.type,
      status: InspectionStatus.DRAFT,
      areaId: dto.areaId,
      mueId: dto.mueId,
      inspectorId,
      criticalControlId: dto.criticalControlId ?? null,
      scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
      notes: dto.notes ?? null,
    });
    const saved = await this.inspections.save(entity);
    return this.toResponse(saved);
  }

  async updateStatus(id: string, dto: UpdateInspectionStatusDto): Promise<InspectionResponse> {
    const entity = await this.inspections.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Inspection ${id} not found`);
    }
    entity.status = dto.status;
    const saved = await this.inspections.save(entity);
    return this.toResponse(saved);
  }

  private toResponse(entity: InspectionEntity): InspectionResponse {
    return {
      id: entity.id,
      title: entity.title,
      type: entity.type,
      status: entity.status,
      areaId: entity.areaId,
      mueId: entity.mueId,
      criticalControlId: entity.criticalControlId,
      inspectorId: entity.inspectorId,
      scheduledFor: entity.scheduledFor ? entity.scheduledFor.toISOString() : null,
      notes: entity.notes,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
