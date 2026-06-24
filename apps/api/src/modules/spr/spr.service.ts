import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SprMeasureGroupResponse,
  SprMonthlyRecordResponse,
  SprParameterAreaAssignmentResponse,
  SprParameterResponse,
  SprRecordStatus,
  SprUnitResponse,
} from '@aurelia/contracts';
import { CreateSprMonthlyRecordDto } from './dto/create-spr-monthly-record.dto';
import { UpdateSprMonthlyRecordStatusDto } from './dto/update-spr-monthly-record-status.dto';
import { UpdateSprMonthlyRecordDto } from './dto/update-spr-monthly-record.dto';
import { SprMeasureGroupEntity } from './entities/spr-measure-group.entity';
import { SprMonthlyRecordEntity } from './entities/spr-monthly-record.entity';
import { SprParameterAreaAssignmentEntity } from './entities/spr-parameter-area-assignment.entity';
import { SprParameterEntity } from './entities/spr-parameter.entity';
import { SprUnitEntity } from './entities/spr-unit.entity';

@Injectable()
export class SprService {
  constructor(
    @InjectRepository(SprMeasureGroupEntity)
    private readonly measureGroupsRepository: Repository<SprMeasureGroupEntity>,
    @InjectRepository(SprUnitEntity)
    private readonly unitsRepository: Repository<SprUnitEntity>,
    @InjectRepository(SprParameterEntity)
    private readonly parametersRepository: Repository<SprParameterEntity>,
    @InjectRepository(SprParameterAreaAssignmentEntity)
    private readonly assignmentsRepository: Repository<SprParameterAreaAssignmentEntity>,
    @InjectRepository(SprMonthlyRecordEntity)
    private readonly monthlyRecordsRepository: Repository<SprMonthlyRecordEntity>,
  ) {}

  async findGroups(): Promise<SprMeasureGroupResponse[]> {
    const groups = await this.measureGroupsRepository.find({ order: { sortOrder: 'ASC', code: 'ASC' } });
    return groups.map((group) => this.toMeasureGroupResponse(group));
  }

  async findUnits(): Promise<SprUnitResponse[]> {
    const units = await this.unitsRepository.find({ order: { code: 'ASC' } });
    return units.map((unit) => this.toUnitResponse(unit));
  }

  async findParameters(): Promise<SprParameterResponse[]> {
    const parameters = await this.parametersRepository.find({ order: { sortOrder: 'ASC', code: 'ASC' } });
    return parameters.map((parameter) => this.toParameterResponse(parameter));
  }

  async findAssignments(): Promise<SprParameterAreaAssignmentResponse[]> {
    const assignments = await this.assignmentsRepository.find({ order: { createdAt: 'DESC' } });
    return assignments.map((assignment) => this.toAssignmentResponse(assignment));
  }

  async createMonthlyRecord(dto: CreateSprMonthlyRecordDto): Promise<SprMonthlyRecordResponse> {
    await this.ensureParameterExists(dto.parameterId);
    const assignment = dto.assignmentId ? await this.ensureAssignmentExists(dto.assignmentId) : null;
    const areaId = dto.areaId ?? assignment?.areaId ?? null;

    if (assignment && assignment.parameterId !== dto.parameterId) {
      throw new ConflictException('Assignment does not belong to the selected SPR parameter');
    }

    const existing = await this.findRecordForPeriod(dto.parameterId, areaId, dto.periodYear, dto.periodMonth);
    if (existing) {
      throw new ConflictException('SPR monthly record already exists for parameter, area and period');
    }

    const record = this.monthlyRecordsRepository.create({
      parameterId: dto.parameterId,
      areaId,
      assignmentId: dto.assignmentId ?? null,
      periodYear: dto.periodYear,
      periodMonth: dto.periodMonth,
      numericValue: dto.numericValue === undefined || dto.numericValue === null ? null : String(dto.numericValue),
      textValue: dto.textValue ?? null,
      booleanValue: dto.booleanValue ?? null,
      notes: dto.notes ?? null,
    });

    const saved = await this.monthlyRecordsRepository.save(record);
    return this.toMonthlyRecordResponse(saved);
  }

  async findMonthlyRecords(query: Record<string, string | undefined>): Promise<SprMonthlyRecordResponse[]> {
    const builder = this.monthlyRecordsRepository.createQueryBuilder('record').orderBy('record.created_at', 'DESC');

    if (query.parameterId) builder.andWhere('record.parameter_id = :parameterId', { parameterId: query.parameterId });
    if (query.areaId) builder.andWhere('record.area_id = :areaId', { areaId: query.areaId });
    if (query.status) builder.andWhere('record.status = :status', { status: query.status });
    if (query.periodYear) builder.andWhere('record.period_year = :periodYear', { periodYear: Number(query.periodYear) });
    if (query.periodMonth) builder.andWhere('record.period_month = :periodMonth', { periodMonth: Number(query.periodMonth) });

    const records = await builder.getMany();
    return records.map((record) => this.toMonthlyRecordResponse(record));
  }

  async findMonthlyRecord(id: string): Promise<SprMonthlyRecordResponse> {
    const record = await this.ensureRecordExists(id);
    return this.toMonthlyRecordResponse(record);
  }

  async updateMonthlyRecord(id: string, dto: UpdateSprMonthlyRecordDto): Promise<SprMonthlyRecordResponse> {
    const record = await this.ensureRecordExists(id);

    if (dto.numericValue !== undefined) record.numericValue = dto.numericValue === null ? null : String(dto.numericValue);
    if (dto.textValue !== undefined) record.textValue = dto.textValue;
    if (dto.booleanValue !== undefined) record.booleanValue = dto.booleanValue;
    if (dto.notes !== undefined) record.notes = dto.notes;

    const saved = await this.monthlyRecordsRepository.save(record);
    return this.toMonthlyRecordResponse(saved);
  }

  async updateMonthlyRecordStatus(id: string, dto: UpdateSprMonthlyRecordStatusDto): Promise<SprMonthlyRecordResponse> {
    const record = await this.ensureRecordExists(id);
    record.status = dto.status;

    if (dto.status === SprRecordStatus.SUBMITTED) {
      record.submittedByUserId = dto.submittedByUserId ?? record.submittedByUserId;
      record.submittedAt = record.submittedAt ?? new Date();
    }

    if (dto.status === SprRecordStatus.APPROVED) {
      record.approvedByUserId = dto.approvedByUserId ?? record.approvedByUserId;
      record.approvedAt = record.approvedAt ?? new Date();
    }

    if (dto.notes !== undefined) record.notes = dto.notes;

    const saved = await this.monthlyRecordsRepository.save(record);
    return this.toMonthlyRecordResponse(saved);
  }

  private async ensureParameterExists(parameterId: string): Promise<SprParameterEntity> {
    const parameter = await this.parametersRepository.findOne({ where: { id: parameterId } });
    if (!parameter) throw new NotFoundException('SPR parameter not found');
    return parameter;
  }

  private async ensureAssignmentExists(assignmentId: string): Promise<SprParameterAreaAssignmentEntity> {
    const assignment = await this.assignmentsRepository.findOne({ where: { id: assignmentId } });
    if (!assignment) throw new NotFoundException('SPR assignment not found');
    return assignment;
  }

  private async ensureRecordExists(id: string): Promise<SprMonthlyRecordEntity> {
    const record = await this.monthlyRecordsRepository.findOne({ where: { id } });
    if (!record) throw new NotFoundException('SPR monthly record not found');
    return record;
  }

  private async findRecordForPeriod(
    parameterId: string,
    areaId: string | null,
    periodYear: number,
    periodMonth: number,
  ): Promise<SprMonthlyRecordEntity | null> {
    const builder = this.monthlyRecordsRepository
      .createQueryBuilder('record')
      .where('record.parameter_id = :parameterId', { parameterId })
      .andWhere('record.period_year = :periodYear', { periodYear })
      .andWhere('record.period_month = :periodMonth', { periodMonth });

    if (areaId) builder.andWhere('record.area_id = :areaId', { areaId });
    else builder.andWhere('record.area_id IS NULL');

    return builder.getOne();
  }

  private toMeasureGroupResponse(group: SprMeasureGroupEntity): SprMeasureGroupResponse {
    return {
      ...group,
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
    };
  }

  private toUnitResponse(unit: SprUnitEntity): SprUnitResponse {
    return {
      ...unit,
      createdAt: unit.createdAt.toISOString(),
      updatedAt: unit.updatedAt.toISOString(),
    };
  }

  private toParameterResponse(parameter: SprParameterEntity): SprParameterResponse {
    return {
      ...parameter,
      createdAt: parameter.createdAt.toISOString(),
      updatedAt: parameter.updatedAt.toISOString(),
    };
  }

  private toAssignmentResponse(assignment: SprParameterAreaAssignmentEntity): SprParameterAreaAssignmentResponse {
    return {
      ...assignment,
      createdAt: assignment.createdAt.toISOString(),
      updatedAt: assignment.updatedAt.toISOString(),
    };
  }

  private toMonthlyRecordResponse(record: SprMonthlyRecordEntity): SprMonthlyRecordResponse {
    return {
      ...record,
      numericValue: record.numericValue === null ? null : Number(record.numericValue),
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      submittedAt: record.submittedAt?.toISOString() ?? null,
      approvedAt: record.approvedAt?.toISOString() ?? null,
    };
  }
}
