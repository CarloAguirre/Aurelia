import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  InspectionDashboardSummaryResponse,
  InspectionFindingSeverity,
  InspectionFindingStatus,
  InspectionResponse,
  InspectionStatus,
} from '@aurelia/contracts';
import { In, Repository } from 'typeorm';
import { ResourceScopeService } from '../access-control/resource-scope.service';
import type { AccessTokenPayload } from '../auth/jwt-token.service';
import { InspectionFindingEntity } from './entities/inspection-finding.entity';
import { InspectionFollowupEntity } from './entities/inspection-followup.entity';
import { InspectionEntity } from './entities/inspection.entity';

@Injectable()
export class InspectionAccessService {
  constructor(
    @InjectRepository(InspectionEntity)
    private readonly inspections: Repository<InspectionEntity>,
    @InjectRepository(InspectionFindingEntity)
    private readonly findings: Repository<InspectionFindingEntity>,
    @InjectRepository(InspectionFollowupEntity)
    private readonly followups: Repository<InspectionFollowupEntity>,
    private readonly resourceScope: ResourceScopeService,
  ) {}

  async assertInspection(user: AccessTokenPayload, inspectionId: string): Promise<InspectionEntity> {
    const inspection = await this.inspections.findOneBy({ id: inspectionId });
    if (!inspection) throw new NotFoundException(`Inspection ${inspectionId} not found`);
    await this.resourceScope.assertCanAccessInspection(user, inspection);
    return inspection;
  }

  async assertFinding(user: AccessTokenPayload, findingId: string): Promise<InspectionFindingEntity> {
    const finding = await this.findings.findOneBy({ id: findingId });
    if (!finding) throw new NotFoundException(`Inspection finding ${findingId} not found`);
    await this.assertInspection(user, finding.inspectionId);
    return finding;
  }

  async assertFollowup(user: AccessTokenPayload, followupId: string): Promise<InspectionFollowupEntity> {
    const followup = await this.followups.findOneBy({ id: followupId });
    if (!followup) throw new NotFoundException(`Inspection followup ${followupId} not found`);
    await this.assertFinding(user, followup.findingId);
    return followup;
  }

  async filterResponses(user: AccessTokenPayload, inspections: InspectionResponse[]): Promise<InspectionResponse[]> {
    return this.resourceScope.filterAllowedInspections(user, inspections);
  }

  async getScopedInspectionIds(user: AccessTokenPayload): Promise<string[]> {
    const inspections = await this.inspections.find({ select: { id: true, companyId: true, areaId: true } });
    const scopedInspections = await this.resourceScope.filterAllowedInspections(user, inspections);
    return scopedInspections.map((inspection) => inspection.id);
  }

  async getDashboardSummary(user: AccessTokenPayload): Promise<InspectionDashboardSummaryResponse> {
    const allInspections = await this.inspections.find();
    const scopedInspections = await this.resourceScope.filterAllowedInspections(user, allInspections);
    const inspectionIds = scopedInspections.map((inspection) => inspection.id);
    const findings = inspectionIds.length === 0
      ? []
      : await this.findings.find({ where: { inspectionId: In(inspectionIds) } });

    const byStatus = this.inspectionStatusCounter();
    const findingsByStatus = this.findingStatusCounter();
    const findingsBySeverity = this.findingSeverityCounter();
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    for (const inspection of scopedInspections) byStatus[inspection.status] += 1;
    for (const finding of findings) {
      findingsByStatus[finding.status] += 1;
      findingsBySeverity[finding.severity] += 1;
    }

    const openFindings = findings.filter((finding) =>
      finding.status === InspectionFindingStatus.OPEN || finding.status === InspectionFindingStatus.IN_PROGRESS,
    );
    const overdue = openFindings.filter((finding) => finding.dueAt && finding.dueAt < now).length;
    const dueSoonNext7Days = openFindings.filter(
      (finding) => finding.dueAt && finding.dueAt >= now && finding.dueAt <= sevenDaysFromNow,
    ).length;
    const withOpenFindings = scopedInspections.filter((inspection) => inspection.openFindingsCount > 0).length;
    const closedRate = scopedInspections.length === 0
      ? 0
      : Number(((byStatus[InspectionStatus.CLOSED] / scopedInspections.length) * 100).toFixed(2));

    return {
      inspections: {
        total: scopedInspections.length,
        byStatus,
        withOpenFindings,
        closedRate,
      },
      findings: {
        total: findings.length,
        byStatus: findingsByStatus,
        bySeverity: findingsBySeverity,
        open: openFindings.length,
        overdue,
        dueSoonNext7Days,
      },
    };
  }

  private inspectionStatusCounter(): Record<InspectionStatus, number> {
    return Object.values(InspectionStatus).reduce<Record<InspectionStatus, number>>((counter, status) => {
      counter[status] = 0;
      return counter;
    }, {} as Record<InspectionStatus, number>);
  }

  private findingStatusCounter(): Record<InspectionFindingStatus, number> {
    return Object.values(InspectionFindingStatus).reduce<Record<InspectionFindingStatus, number>>((counter, status) => {
      counter[status] = 0;
      return counter;
    }, {} as Record<InspectionFindingStatus, number>);
  }

  private findingSeverityCounter(): Record<InspectionFindingSeverity, number> {
    return Object.values(InspectionFindingSeverity).reduce<Record<InspectionFindingSeverity, number>>((counter, severity) => {
      counter[severity] = 0;
      return counter;
    }, {} as Record<InspectionFindingSeverity, number>);
  }
}
