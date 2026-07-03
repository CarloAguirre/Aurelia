import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InspectionFindingSeverity, InspectionFindingStatus, InspectionStatus } from '@aurelia/contracts';
import type {
  InspectionDashboardAreaObservationRowResponse,
  InspectionDashboardChartsResponse,
  InspectionDashboardCompanyAnalysisResponse,
  InspectionDashboardCompanyChartRowResponse,
  InspectionDashboardOpenFindingRowResponse,
  InspectionDashboardOpenFindingsResponse,
} from '@aurelia/contracts';
import { Repository } from 'typeorm';
import { AreaEntity } from '../organization/entities/area.entity';
import { CompanyEntity } from '../organization/entities/company.entity';
import { InspectionFindingEntity } from './entities/inspection-finding.entity';
import { InspectionEntity } from './entities/inspection.entity';

@Injectable()
export class InspectionDashboardService {
  constructor(
    @InjectRepository(InspectionEntity)
    private readonly inspections: Repository<InspectionEntity>,
    @InjectRepository(InspectionFindingEntity)
    private readonly findings: Repository<InspectionFindingEntity>,
    @InjectRepository(AreaEntity)
    private readonly areas: Repository<AreaEntity>,
    @InjectRepository(CompanyEntity)
    private readonly companies: Repository<CompanyEntity>,
  ) {}

  async getCharts(): Promise<InspectionDashboardChartsResponse> {
    const [inspections, findings, areas] = await Promise.all([
      this.inspections.find(),
      this.findings.find(),
      this.areas.find(),
    ]);
    const now = new Date();
    const currentYear = now.getFullYear();
    const periodMonth = now.getMonth();
    const inspectionById = new Map(inspections.map((inspection) => [inspection.id, inspection]));
    const areaNameById = new Map(areas.map((area) => [area.id, area.name]));
    const yearRange = Array.from({ length: 4 }, (_, index) => currentYear - 3 + index);
    const annualInspections = yearRange.map((year) => ({ year, closed: 0, open: 0 }));
    const annualByYear = new Map(annualInspections.map((row) => [row.year, row]));
    const monthlyFindings = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      label: new Intl.DateTimeFormat('es-CL', { month: 'short' }).format(new Date(currentYear, index, 1)).replace('.', ''),
      closed: 0,
      open: 0,
    }));
    const areaObservations = new Map<string, InspectionDashboardAreaObservationRowResponse>();

    let totalForClosure = 0;
    let closedForClosure = 0;
    let periodTotal = 0;
    let periodClosed = 0;

    inspections.forEach((inspection) => {
      if (inspection.status === InspectionStatus.CANCELLED) return;

      const date = this.resolveInspectionDate(inspection);
      totalForClosure += 1;

      if (inspection.status === InspectionStatus.CLOSED) {
        closedForClosure += 1;
      }

      if (date && date.getFullYear() === currentYear && date.getMonth() === periodMonth) {
        periodTotal += 1;
        if (inspection.status === InspectionStatus.CLOSED) {
          periodClosed += 1;
        }
      }

      if (!date) return;

      const annualRow = annualByYear.get(date.getFullYear());
      if (!annualRow) return;

      if (inspection.status === InspectionStatus.CLOSED) {
        annualRow.closed += 1;
        return;
      }

      annualRow.open += 1;
    });

    findings.forEach((finding) => {
      if (finding.status === InspectionFindingStatus.CANCELLED) return;
      const date = finding.createdAt;
      if (date.getFullYear() !== currentYear) return;

      const row = monthlyFindings[date.getMonth()];
      if (row) {
        if (finding.status === InspectionFindingStatus.CLOSED) {
          row.closed += 1;
        } else {
          row.open += 1;
        }
      }

      const inspection = inspectionById.get(finding.inspectionId);
      const areaId = inspection?.areaId ?? null;
      const areaKey = areaId ?? 'sin-area';
      const areaRow = areaObservations.get(areaKey) ?? {
        areaId,
        area: this.formatAreaLabel(areaId, areaNameById),
        closed: 0,
        open: 0,
      };

      if (finding.status === InspectionFindingStatus.CLOSED) {
        areaRow.closed += 1;
      } else {
        areaRow.open += 1;
      }

      areaObservations.set(areaKey, areaRow);
    });

    const historicalRate = totalForClosure > 0 ? Number(((closedForClosure / totalForClosure) * 100).toFixed(2)) : 0;
    const periodRate = periodTotal > 0 ? Number(((periodClosed / periodTotal) * 100).toFixed(2)) : 0;

    return {
      annualInspections,
      monthlyFindings,
      areaObservations: Array.from(areaObservations.values())
        .sort((a, b) => b.closed + b.open - (a.closed + a.open))
        .slice(0, 10),
      closure: {
        historicalRate,
        periodRate,
        periodLabel: new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' }).format(now),
      },
    };
  }

  async getCompanyAnalysis(): Promise<InspectionDashboardCompanyAnalysisResponse> {
    const [inspections, findings, companies] = await Promise.all([
      this.inspections.find(),
      this.findings.find(),
      this.companies.find(),
    ]);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const inspectionById = new Map(inspections.map((inspection) => [inspection.id, inspection]));
    const companyNameById = new Map(companies.map((company) => [company.id, company.name]));
    const companiesWithOpenFindings = new Set<string>();
    const openInspections = new Set<string>();
    const openAges: number[] = [];
    const chartRowsByCompany = new Map<string, InspectionDashboardCompanyChartRowResponse>();

    findings.forEach((finding) => {
      const inspection = inspectionById.get(finding.inspectionId);
      const companyId = finding.responsibleCompanyId ?? inspection?.companyId ?? null;
      const date = finding.createdAt;

      if (this.isOpenFinding(finding)) {
        if (companyId) {
          companiesWithOpenFindings.add(companyId);
        }

        openInspections.add(finding.inspectionId);
        openAges.push(this.daysBetween(finding.createdAt, now));
      }

      if (finding.status === InspectionFindingStatus.CANCELLED || date.getFullYear() !== currentYear || date.getMonth() !== currentMonth) {
        return;
      }

      const companyKey = companyId ?? 'sin-empresa';
      const row = chartRowsByCompany.get(companyKey) ?? {
        companyId,
        company: this.formatCompanyLabel(companyId, companyNameById),
        closed: 0,
        open: 0,
      };

      if (finding.status === InspectionFindingStatus.CLOSED) {
        row.closed += 1;
      } else {
        row.open += 1;
      }

      chartRowsByCompany.set(companyKey, row);
    });

    const openFindings = openAges.length;
    const maxOpenDays = openAges.length > 0 ? Math.max(...openAges) : 0;
    const averageOpenDays = openAges.length > 0 ? Number((openAges.reduce((sum, value) => sum + value, 0) / openAges.length).toFixed(1)) : 0;

    return {
      companiesWithOpenFindings: companiesWithOpenFindings.size,
      openFindings,
      openInspections: openInspections.size,
      openDays: {
        max: maxOpenDays,
        average: averageOpenDays,
      },
      chartRows: Array.from(chartRowsByCompany.values())
        .sort((a, b) => b.closed + b.open - (a.closed + a.open))
        .slice(0, 8),
    };
  }

  async getOpenFindings(): Promise<InspectionDashboardOpenFindingsResponse> {
    const [inspections, findings, companies, areas] = await Promise.all([
      this.inspections.find(),
      this.findings.find(),
      this.companies.find(),
      this.areas.find(),
    ]);
    const now = new Date();
    const inspectionById = new Map(inspections.map((inspection, index) => [inspection.id, { inspection, index }]));
    const companyNameById = new Map(companies.map((company) => [company.id, company.name]));
    const areaNameById = new Map(areas.map((area) => [area.id, area.name]));
    const rowsByInspection = new Map<string, InspectionDashboardOpenFindingRowResponse>();
    let severeOpenFindings = 0;

    findings.forEach((finding) => {
      if (!this.isOpenFinding(finding)) return;

      const inspectionEntry = inspectionById.get(finding.inspectionId);
      if (!inspectionEntry) return;

      const { inspection, index } = inspectionEntry;
      const companyId = finding.responsibleCompanyId ?? inspection.companyId ?? null;
      const ageDays = this.daysBetween(finding.createdAt, now);
      const isSevere = this.isSevereFinding(finding);
      const current = rowsByInspection.get(inspection.id) ?? {
        inspectionId: inspection.id,
        inspectionNumber: this.resolveInspectionNumber(inspection, index),
        companyId,
        company: this.formatCompanyLabel(companyId, companyNameById),
        areaId: inspection.areaId,
        area: this.formatAreaLabel(inspection.areaId, areaNameById),
        ageDays: 0,
        openFindings: 0,
        severeOpenFindings: 0,
        hasSevereOpenFindings: false,
        maxSeverity: null,
        severityCounts: {
          severe: 0,
          moderate: 0,
          minor: 0,
        },
      };

      current.ageDays = Math.max(current.ageDays, ageDays);
      current.openFindings += 1;
      current.maxSeverity = this.resolveMaxSeverity(current.maxSeverity, finding.severity);

      if (isSevere) {
        current.severeOpenFindings += 1;
        current.hasSevereOpenFindings = true;
        current.severityCounts.severe += 1;
        severeOpenFindings += 1;
      } else if (finding.severity === InspectionFindingSeverity.MEDIUM) {
        current.severityCounts.moderate += 1;
      } else {
        current.severityCounts.minor += 1;
      }

      rowsByInspection.set(inspection.id, current);
    });

    const rows = Array.from(rowsByInspection.values())
      .sort((a, b) => Number(b.hasSevereOpenFindings) - Number(a.hasSevereOpenFindings) || b.ageDays - a.ageDays || b.openFindings - a.openFindings)
      .slice(0, 20);

    return {
      severeOpenFindings,
      openInspections: rowsByInspection.size,
      rows,
    };
  }

  private resolveInspectionDate(inspection: InspectionEntity): Date | null {
    return inspection.startedAt ?? inspection.scheduledAt ?? inspection.createdAt ?? null;
  }

  private formatAreaLabel(areaId: string | null, areaNameById: Map<string, string>): string {
    if (!areaId) return 'Sin Área';
    return areaNameById.get(areaId) ?? `Área ${areaId.slice(0, 8).toUpperCase()}`;
  }

  private formatCompanyLabel(companyId: string | null, companyNameById: Map<string, string>): string {
    if (!companyId) return 'Sin Empresa';
    return companyNameById.get(companyId) ?? `Empresa ${companyId.slice(0, 8).toUpperCase()}`;
  }

  private isOpenFinding(finding: InspectionFindingEntity): boolean {
    return finding.status !== InspectionFindingStatus.CLOSED && finding.status !== InspectionFindingStatus.CANCELLED;
  }

  private isSevereFinding(finding: InspectionFindingEntity): boolean {
    return finding.severity === InspectionFindingSeverity.HIGH || finding.severity === InspectionFindingSeverity.CRITICAL;
  }

  private resolveInspectionNumber(inspection: InspectionEntity, index: number): string {
    const titleNumber = inspection.title.match(/\d+/)?.[0];
    return titleNumber ?? String(index + 1).padStart(2, '0');
  }

  private resolveMaxSeverity(current: InspectionFindingSeverity | null, candidate: InspectionFindingSeverity): InspectionFindingSeverity {
    const order = [InspectionFindingSeverity.LOW, InspectionFindingSeverity.MEDIUM, InspectionFindingSeverity.HIGH, InspectionFindingSeverity.CRITICAL];
    return order.indexOf(candidate) > order.indexOf(current ?? InspectionFindingSeverity.LOW) ? candidate : current ?? candidate;
  }

  private daysBetween(from: Date, to: Date): number {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.max(0, Math.floor((to.getTime() - from.getTime()) / millisecondsPerDay));
  }
}
