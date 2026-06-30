import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ControlSelfAssessmentAnswerEntity } from '../mue/entities/control-self-assessment-answer.entity';
import { ControlSelfAssessmentEntity } from '../mue/entities/control-self-assessment.entity';
import { ControlVerificationItemEntity } from '../mue/entities/control-verification-item.entity';
import { CreateControlSelfAssessmentDto, UpsertControlSelfAssessmentAnswersDto } from './dto/create-control-self-assessment.dto';

@Injectable()
export class CriticalControlsService {
  constructor(
    @InjectRepository(ControlSelfAssessmentEntity)
    private readonly assessments: Repository<ControlSelfAssessmentEntity>,
    @InjectRepository(ControlSelfAssessmentAnswerEntity)
    private readonly answers: Repository<ControlSelfAssessmentAnswerEntity>,
    @InjectRepository(ControlVerificationItemEntity)
    private readonly verificationItems: Repository<ControlVerificationItemEntity>,
  ) {}

  async createAssessment(dto: CreateControlSelfAssessmentDto, createdByUserId: string | null): Promise<ControlSelfAssessmentEntity> {
    const assessment = await this.assessments.save(
      this.assessments.create({
        mueId: dto.mueId,
        criticalControlId: dto.criticalControlId ?? null,
        areaId: dto.areaId ?? null,
        gerenciaId: dto.gerenciaId ?? null,
        companyId: dto.companyId ?? null,
        periodYear: dto.periodYear,
        periodMonth: dto.periodMonth,
        status: 'draft',
        createdByUserId,
      }),
    );
    return this.findAssessment(assessment.id);
  }

  async findAssessments(mueId?: string, status?: string): Promise<ControlSelfAssessmentEntity[]> {
    return this.assessments.find({
      where: {
        ...(mueId ? { mueId } : {}),
        ...(status ? { status } : {}),
      },
      relations: { mue: true, criticalControl: true, answers: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findAssessment(id: string): Promise<ControlSelfAssessmentEntity> {
    const assessment = await this.assessments.findOne({
      where: { id },
      relations: { mue: true, criticalControl: true, answers: { verificationItem: true } },
      order: { answers: { createdAt: 'ASC' } },
    });
    if (!assessment) throw new NotFoundException('Control self assessment not found');
    return assessment;
  }

  async upsertAnswers(id: string, dto: UpsertControlSelfAssessmentAnswersDto): Promise<ControlSelfAssessmentEntity> {
    const assessment = await this.findAssessment(id);
    if (assessment.status !== 'draft') throw new BadRequestException('Only draft assessments can be edited');

    for (const input of dto.answers) {
      const item = await this.verificationItems.findOneBy({ id: input.verificationItemId });
      if (!item) throw new NotFoundException(`Verification item ${input.verificationItemId} not found`);

      const current = await this.answers.findOneBy({ assessmentId: id, verificationItemId: input.verificationItemId });
      const answer = current ?? this.answers.create({ assessmentId: id, verificationItemId: input.verificationItemId });
      answer.answer = input.answer;
      answer.comment = input.comment ?? null;
      answer.riskLevel = input.riskLevel ?? null;
      answer.actionRequired = input.actionRequired ?? input.answer === 'no';
      await this.answers.save(answer);
    }

    await this.recalculateScore(id);
    return this.findAssessment(id);
  }

  async submitAssessment(id: string, submittedByUserId: string | null): Promise<ControlSelfAssessmentEntity> {
    const assessment = await this.findAssessment(id);
    if (assessment.status !== 'draft') throw new BadRequestException('Only draft assessments can be submitted');
    if (!assessment.answers?.length) throw new BadRequestException('Assessment has no answers');

    assessment.status = 'submitted';
    assessment.submittedByUserId = submittedByUserId;
    assessment.submittedAt = new Date();
    await this.assessments.save(assessment);
    return this.findAssessment(id);
  }

  private async recalculateScore(assessmentId: string): Promise<void> {
    const rows = await this.answers.find({ where: { assessmentId } });
    const applicable = rows.filter((row) => row.answer !== 'not_applicable' && row.answer !== 'not_observed');
    if (applicable.length === 0) {
      await this.assessments.update(assessmentId, { complianceScore: null });
      return;
    }

    const points = applicable.reduce((total, row) => {
      if (row.answer === 'yes') return total + 100;
      if (row.answer === 'partial') return total + 50;
      return total;
    }, 0);
    const score = (points / applicable.length).toFixed(2);
    await this.assessments.update(assessmentId, { complianceScore: score });
  }
}
