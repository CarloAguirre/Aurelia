import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ControlAreaAssignmentEntity } from './entities/control-area-assignment.entity';
import { ControlVerificationItemEntity } from './entities/control-verification-item.entity';
import { CriticalControlEntity } from './entities/critical-control.entity';
import { MueEntity } from './entities/mue.entity';

@Injectable()
export class MueService {
  constructor(
    @InjectRepository(MueEntity)
    private readonly mues: Repository<MueEntity>,
    @InjectRepository(CriticalControlEntity)
    private readonly controls: Repository<CriticalControlEntity>,
    @InjectRepository(ControlVerificationItemEntity)
    private readonly verificationItems: Repository<ControlVerificationItemEntity>,
    @InjectRepository(ControlAreaAssignmentEntity)
    private readonly assignments: Repository<ControlAreaAssignmentEntity>,
  ) {}

  async findMues(): Promise<MueEntity[]> {
    return this.mues.find({ where: { isActive: true }, order: { code: 'ASC' } });
  }

  async findMue(id: string): Promise<MueEntity> {
    const entity = await this.mues.findOne({ where: { id }, relations: { controls: true } });
    if (!entity) throw new NotFoundException('MUE not found');
    return entity;
  }

  async findControls(mueId?: string): Promise<CriticalControlEntity[]> {
    return this.controls.find({
      where: mueId ? { mueId, isActive: true } : { isActive: true },
      relations: { mue: true },
      order: { code: 'ASC' },
    });
  }

  async findVerificationItems(criticalControlId?: string): Promise<ControlVerificationItemEntity[]> {
    return this.verificationItems.find({
      where: criticalControlId ? { criticalControlId, isActive: true } : { isActive: true },
      relations: { criticalControl: { mue: true } },
      order: { sortOrder: 'ASC', code: 'ASC' },
    });
  }

  async findAssignments(mueId?: string): Promise<ControlAreaAssignmentEntity[]> {
    return this.assignments.find({
      where: mueId ? { mueId } : {},
      relations: { mue: true, criticalControl: true, area: true, gerencia: true, responsibleUser: true },
      order: { areaNameSnapshot: 'ASC', responsibleNameSnapshot: 'ASC' },
    });
  }
}
