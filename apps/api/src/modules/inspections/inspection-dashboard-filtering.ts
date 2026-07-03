import type { InspectionFindingStatus, InspectionStatus } from '@aurelia/contracts';
import { InspectionFindingSeverity } from '@aurelia/contracts';
import { InspectionFindingEntity } from './entities/inspection-finding.entity';
import { InspectionEntity } from './entities/inspection.entity';

export type InspectionDashboardPeriodFilter = 'year' | 'q1' | 'q2' | 'q3' | 'q4' | 'm1' | 'm2' | 'm3' | 'm4' | 'm5' | 'm6' | 'm7' | 'm8' | 'm9' | 'm10' | 'm11' | 'm12';

export interface InspectionDashboardQueryFilters {
  year?: number | string;
  period?: InspectionDashboardPeriodFilter | string;
  companyId?: string | null;
}

export interface InspectionDashboardResolvedFilters {
  year: number;
  period: InspectionDashboardPeriodFilter;
  start: Date;
  end: Date;
  companyId: string | null;
}

const periods: InspectionDashboardPeriodFilter[] = ['year', 'q1', 'q2', 'q3', 'q4', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10', 'm11', 'm12'];
const quarters: Record<string, number[]> = { q1: [0, 1, 2], q2: [3, 4, 5], q3: [6, 7, 8], q4: [9, 10, 11] };

export function resolveInspectionDashboardFilters(query: InspectionDashboardQueryFilters = {}): InspectionDashboardResolvedFilters {
  const currentYear = new Date().getFullYear();
  const rawYear = typeof query.year === 'number' ? query.year : Number(query.year);
  const year = Number.isInteger(rawYear) && rawYear >= 2000 && rawYear <= currentYear + 1 ? rawYear : currentYear;
  const period = periods.includes(query.period as InspectionDashboardPeriodFilter) ? query.period as InspectionDashboardPeriodFilter : 'q1';
  const months = resolveInspectionDashboardPeriodMonths(period);

  return {
    year,
    period,
    start: new Date(year, months[0] ?? 0, 1),
    end: new Date(year, (months[months.length - 1] ?? 11) + 1, 1),
    companyId: typeof query.companyId === 'string' && query.companyId.trim() ? query.companyId.trim() : null,
  };
}

export function resolveInspectionDashboardPeriodMonths(period: InspectionDashboardPeriodFilter): number[] {
  if (period === 'year') return Array.from({ length: 12 }, (_, index) => index);
  if (period.startsWith('m')) return [Number(period.slice(1)) - 1];
  return quarters[period] ?? quarters.q1;
}

export function resolveDashboardInspectionDate(inspection: InspectionEntity): Date | null {
  return inspection.startedAt ?? inspection.scheduledAt ?? inspection.createdAt ?? null;
}

export function isDashboardDateInRange(date: Date | null, filters: InspectionDashboardResolvedFilters): boolean {
  return Boolean(date && date >= filters.start && date < filters.end);
}

export function inspectionMatchesDashboardFilters(inspection: InspectionEntity, filters: InspectionDashboardResolvedFilters): boolean {
  if (filters.companyId && inspection.companyId !== filters.companyId) return false;
  return isDashboardDateInRange(resolveDashboardInspectionDate(inspection), filters);
}

export function findingMatchesDashboardFilters(finding: InspectionFindingEntity, inspection: InspectionEntity | null, filters: InspectionDashboardResolvedFilters): boolean {
  const companyId = finding.responsibleCompanyId ?? inspection?.companyId ?? null;
  if (filters.companyId && companyId !== filters.companyId) return false;
  return isDashboardDateInRange(finding.createdAt, filters);
}

export function isDashboardOpenFinding(finding: InspectionFindingEntity): boolean {
  return finding.status !== ('closed' as InspectionFindingStatus) && finding.status !== ('cancelled' as InspectionFindingStatus);
}

export function isDashboardSevereFinding(finding: InspectionFindingEntity): boolean {
  return finding.severity === InspectionFindingSeverity.HIGH || finding.severity === InspectionFindingSeverity.CRITICAL;
}

export function formatInspectionDashboardPeriodLabel(filters: InspectionDashboardResolvedFilters): string {
  if (filters.period === 'year') return `${filters.year}`;
  if (filters.period.startsWith('m')) {
    return new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' }).format(new Date(filters.year, resolveInspectionDashboardPeriodMonths(filters.period)[0] ?? 0, 1));
  }

  const labels: Record<string, string> = {
    q1: `T1 · Ene-Mar ${filters.year}`,
    q2: `T2 · Abr-Jun ${filters.year}`,
    q3: `T3 · Jul-Sep ${filters.year}`,
    q4: `T4 · Oct-Dic ${filters.year}`,
  };

  return labels[filters.period] ?? `${filters.year}`;
}

export function createInspectionStatusRecord<T extends string>(values: T[]): Record<T, number> {
  return values.reduce((acc, value) => ({ ...acc, [value]: 0 }), {} as Record<T, number>);
}
