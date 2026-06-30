import { Injectable } from '@nestjs/common';
import {
  IncidentActionPlanStatus,
  IncidentStatus,
  InspectionFindingStatus,
  InspectionStatus,
  ReportFilterRequest,
  ReportSummaryResponse,
} from '@aurelia/contracts';
import { DataSource } from 'typeorm';

export interface CountReportRow {
  key: string;
  label: string | null;
  count: number;
}

export interface PeriodReportRow {
  period: string;
  count: number;
}

export interface InspectionSummaryReport {
  total: number;
  open: number;
  closed: number;
  cancelled: number;
  openFindings: number;
  overdueFindings: number;
  byStatus: Record<string, number>;
}

export interface IncidentSummaryReport {
  total: number;
  open: number;
  closed: number;
  cancelled: number;
  overdueSla: number;
  dueSoonNext24Hours: number;
  byStatus: Record<string, number>;
  actionPlans: {
    total: number;
    open: number;
    overdue: number;
    byStatus: Record<string, number>;
  };
}

export interface OpenItemsReport {
  inspectionsOpen: number;
  inspectionFindingsOpen: number;
  inspectionFindingsOverdue: number;
  incidentsOpen: number;
  incidentSlaOverdue: number;
  incidentActionPlansOpen: number;
  incidentActionPlansOverdue: number;
}

type ReportFilters = ReportFilterRequest & {
  companyId?: string;
  incidentTypeId?: string;
  incidentLevelId?: string;
};

type QueryParts = {
  sql: string;
  params: unknown[];
};

@Injectable()
export class ReportsService {
  constructor(private readonly dataSource: DataSource) {}

  async summary(filter: ReportFilters): Promise<ReportSummaryResponse> {
    const [inspections, incidents, byLevel] = await Promise.all([
      this.inspectionsSummary(filter),
      this.incidentsSummary(filter),
      this.incidentsByLevel(filter),
    ]);

    return {
      totalInspections: inspections.total,
      totalIncidents: incidents.total,
      openIncidents: incidents.open,
      byRiskLevel: this.rowsToRecord(byLevel),
      byStatus: incidents.byStatus,
    };
  }

  async inspectionsSummary(filter: ReportFilters): Promise<InspectionSummaryReport> {
    const where = this.buildWhere('i', filter, 'created_at');
    const findingsWhere = this.buildJoinedInspectionFindingWhere(filter);
    const byStatus = await this.countByStatus('inspections', 'i', filter, 'created_at');

    const [total, open, closed, cancelled, openFindings, overdueFindings] = await Promise.all([
      this.countScalar(`SELECT COUNT(*)::int AS count FROM inspections i ${where.sql}`, where.params),
      this.countScalar(
        `SELECT COUNT(*)::int AS count FROM inspections i ${where.sqlWithExtra('i.status NOT IN ($next, $next)', [InspectionStatus.CLOSED, InspectionStatus.CANCELLED])}`,
        where.params,
      ),
      this.countScalar(
        `SELECT COUNT(*)::int AS count FROM inspections i ${where.sqlWithExtra('i.status = $next', [InspectionStatus.CLOSED])}`,
        where.params,
      ),
      this.countScalar(
        `SELECT COUNT(*)::int AS count FROM inspections i ${where.sqlWithExtra('i.status = $next', [InspectionStatus.CANCELLED])}`,
        where.params,
      ),
      this.countScalar(
        `SELECT COUNT(*)::int AS count FROM inspection_findings f JOIN inspections i ON i.id = f.inspection_id ${findingsWhere.sqlWithExtra('f.status NOT IN ($next, $next)', [InspectionFindingStatus.CLOSED, InspectionFindingStatus.CANCELLED])}`,
        findingsWhere.params,
      ),
      this.countScalar(
        `SELECT COUNT(*)::int AS count FROM inspection_findings f JOIN inspections i ON i.id = f.inspection_id ${findingsWhere.sqlWithExtra('f.due_at IS NOT NULL AND f.due_at < NOW() AND f.status NOT IN ($next, $next)', [InspectionFindingStatus.CLOSED, InspectionFindingStatus.CANCELLED])}`,
        findingsWhere.params,
      ),
    ]);

    return { total, open, closed, cancelled, openFindings, overdueFindings, byStatus };
  }

  async incidentsSummary(filter: ReportFilters): Promise<IncidentSummaryReport> {
    const where = this.buildWhere('i', filter, 'reported_at');
    const actionPlanWhere = this.buildJoinedIncidentActionPlanWhere(filter);
    const byStatus = await this.countByStatus('incidents', 'i', filter, 'reported_at');
    const actionPlanByStatus = await this.countActionPlansByStatus(filter);

    const [total, open, closed, cancelled, overdueSla, dueSoonNext24Hours, actionPlansTotal, actionPlansOpen, actionPlansOverdue] = await Promise.all([
      this.countScalar(`SELECT COUNT(*)::int AS count FROM incidents i ${where.sql}`, where.params),
      this.countScalar(
        `SELECT COUNT(*)::int AS count FROM incidents i ${where.sqlWithExtra('i.status NOT IN ($next, $next)', [IncidentStatus.CLOSED, IncidentStatus.CANCELLED])}`,
        where.params,
      ),
      this.countScalar(
        `SELECT COUNT(*)::int AS count FROM incidents i ${where.sqlWithExtra('i.status = $next', [IncidentStatus.CLOSED])}`,
        where.params,
      ),
      this.countScalar(
        `SELECT COUNT(*)::int AS count FROM incidents i ${where.sqlWithExtra('i.status = $next', [IncidentStatus.CANCELLED])}`,
        where.params,
      ),
      this.countScalar(
        `SELECT COUNT(*)::int AS count FROM incidents i ${where.sqlWithExtra('i.sla_due_at IS NOT NULL AND i.sla_due_at < NOW() AND i.status NOT IN ($next, $next)', [IncidentStatus.CLOSED, IncidentStatus.CANCELLED])}`,
        where.params,
      ),
      this.countScalar(
        `SELECT COUNT(*)::int AS count FROM incidents i ${where.sqlWithExtra('i.sla_due_at IS NOT NULL AND i.sla_due_at >= NOW() AND i.sla_due_at <= NOW() + INTERVAL '24 hours' AND i.status NOT IN ($next, $next)', [IncidentStatus.CLOSED, IncidentStatus.CANCELLED])}`,
        where.params,
      ),
      this.countScalar(`SELECT COUNT(*)::int AS count FROM incident_action_plans ap JOIN incidents i ON i.id = ap.incident_id ${actionPlanWhere.sql}`, actionPlanWhere.params),
      this.countScalar(
        `SELECT COUNT(*)::int AS count FROM incident_action_plans ap JOIN incidents i ON i.id = ap.incident_id ${actionPlanWhere.sqlWithExtra('ap.status NOT IN ($next, $next)', [IncidentActionPlanStatus.COMPLETED, IncidentActionPlanStatus.CANCELLED])}`,
        actionPlanWhere.params,
      ),
      this.countScalar(
        `SELECT COUNT(*)::int AS count FROM incident_action_plans ap JOIN incidents i ON i.id = ap.incident_id ${actionPlanWhere.sqlWithExtra('ap.due_at IS NOT NULL AND ap.due_at < NOW() AND ap.status NOT IN ($next, $next)', [IncidentActionPlanStatus.COMPLETED, IncidentActionPlanStatus.CANCELLED])}`,
        actionPlanWhere.params,
      ),
    ]);

    return {
      total,
      open,
      closed,
      cancelled,
      overdueSla,
      dueSoonNext24Hours,
      byStatus,
      actionPlans: {
        total: actionPlansTotal,
        open: actionPlansOpen,
        overdue: actionPlansOverdue,
        byStatus: actionPlanByStatus,
      },
    };
  }

  async incidentsByLevel(filter: ReportFilters): Promise<CountReportRow[]> {
    const where = this.buildWhere('i', filter, 'reported_at');
    const rows = await this.dataSource.query(
      `SELECT l.code AS key,
              l.name AS label,
              COUNT(*)::int AS count
       FROM incidents i
       JOIN incident_levels l ON l.id = i.incident_level_id
       ${where.sql}
       GROUP BY l.code, l.name, l.level_number
       ORDER BY l.level_number ASC`,
      where.params,
    ) as Array<{ key: string; label: string | null; count: string | number }>;

    return this.normalizeCountRows(rows);
  }

  async incidentsByType(filter: ReportFilters): Promise<CountReportRow[]> {
    const where = this.buildWhere('i', filter, 'reported_at');
    const rows = await this.dataSource.query(
      `SELECT t.code AS key,
              t.name AS label,
              COUNT(*)::int AS count
       FROM incidents i
       JOIN incident_types t ON t.id = i.incident_type_id
       ${where.sql}
       GROUP BY t.code, t.name
       ORDER BY count DESC, t.name ASC`,
      where.params,
    ) as Array<{ key: string; label: string | null; count: string | number }>;

    return this.normalizeCountRows(rows);
  }

  async incidentsByCompany(filter: ReportFilters): Promise<CountReportRow[]> {
    const where = this.buildWhere('i', filter, 'reported_at');
    const rows = await this.dataSource.query(
      `SELECT COALESCE(c.code, 'NO_COMPANY') AS key,
              COALESCE(c.name, 'Sin empresa') AS label,
              COUNT(*)::int AS count
       FROM incidents i
       LEFT JOIN companies c ON c.id = i.company_id
       ${where.sql}
       GROUP BY COALESCE(c.code, 'NO_COMPANY'), COALESCE(c.name, 'Sin empresa')
       ORDER BY count DESC, label ASC`,
      where.params,
    ) as Array<{ key: string; label: string | null; count: string | number }>;

    return this.normalizeCountRows(rows);
  }

  async incidentsByPeriod(filter: ReportFilters): Promise<PeriodReportRow[]> {
    const where = this.buildWhere('i', filter, 'reported_at');
    const rows = await this.dataSource.query(
      `SELECT TO_CHAR(DATE_TRUNC('month', i.reported_at), 'YYYY-MM') AS period,
              COUNT(*)::int AS count
       FROM incidents i
       ${where.sql}
       GROUP BY DATE_TRUNC('month', i.reported_at)
       ORDER BY DATE_TRUNC('month', i.reported_at) ASC`,
      where.params,
    ) as Array<{ period: string; count: string | number }>;

    return rows.map((row) => ({ period: row.period, count: Number(row.count) }));
  }

  async openItems(filter: ReportFilters): Promise<OpenItemsReport> {
    const inspections = await this.inspectionsSummary(filter);
    const incidents = await this.incidentsSummary(filter);

    return {
      inspectionsOpen: inspections.open,
      inspectionFindingsOpen: inspections.openFindings,
      inspectionFindingsOverdue: inspections.overdueFindings,
      incidentsOpen: incidents.open,
      incidentSlaOverdue: incidents.overdueSla,
      incidentActionPlansOpen: incidents.actionPlans.open,
      incidentActionPlansOverdue: incidents.actionPlans.overdue,
    };
  }

  private async countByStatus(table: string, alias: string, filter: ReportFilters, dateColumn: string): Promise<Record<string, number>> {
    const where = this.buildWhere(alias, filter, dateColumn);
    const rows = await this.dataSource.query(
      `SELECT ${alias}.status AS key, COUNT(*)::int AS count FROM ${table} ${alias} ${where.sql} GROUP BY ${alias}.status ORDER BY ${alias}.status ASC`,
      where.params,
    ) as Array<{ key: string; count: string | number }>;

    return rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.key] = Number(row.count);
      return acc;
    }, {});
  }

  private async countActionPlansByStatus(filter: ReportFilters): Promise<Record<string, number>> {
    const where = this.buildJoinedIncidentActionPlanWhere(filter);
    const rows = await this.dataSource.query(
      `SELECT ap.status AS key, COUNT(*)::int AS count
       FROM incident_action_plans ap
       JOIN incidents i ON i.id = ap.incident_id
       ${where.sql}
       GROUP BY ap.status
       ORDER BY ap.status ASC`,
      where.params,
    ) as Array<{ key: string; count: string | number }>;

    return rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.key] = Number(row.count);
      return acc;
    }, {});
  }

  private async countScalar(sql: string, params: unknown[]): Promise<number> {
    const rows = await this.dataSource.query(sql, params) as Array<{ count: string | number }>;
    return Number(rows[0]?.count ?? 0);
  }

  private buildWhere(alias: string, filter: ReportFilters, dateColumn: string): QueryParts & { sqlWithExtra: (condition: string, values?: unknown[]) => string } {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filter.companyId) {
      params.push(filter.companyId);
      conditions.push(`${alias}.company_id = $${params.length}`);
    }

    if (filter.areaId) {
      params.push(filter.areaId);
      conditions.push(`${alias}.area_id = $${params.length}`);
    }

    if (filter.from) {
      params.push(filter.from);
      conditions.push(`${alias}.${dateColumn} >= $${params.length}`);
    }

    if (filter.to) {
      params.push(filter.to);
      conditions.push(`${alias}.${dateColumn} <= $${params.length}`);
    }

    return this.withExtraConditions(conditions, params);
  }

  private buildJoinedInspectionFindingWhere(filter: ReportFilters): QueryParts & { sqlWithExtra: (condition: string, values?: unknown[]) => string } {
    return this.buildWhere('i', filter, 'created_at');
  }

  private buildJoinedIncidentActionPlanWhere(filter: ReportFilters): QueryParts & { sqlWithExtra: (condition: string, values?: unknown[]) => string } {
    return this.buildWhere('i', filter, 'reported_at');
  }

  private withExtraConditions(conditions: string[], params: unknown[]): QueryParts & { sqlWithExtra: (condition: string, values?: unknown[]) => string } {
    const sql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    return {
      sql,
      params,
      sqlWithExtra: (condition: string, values: unknown[] = []) => {
        const extraConditions = [...conditions];
        const localParams = [...params];
        let renderedCondition = condition;

        for (const value of values) {
          localParams.push(value);
          renderedCondition = renderedCondition.replace('$next', `$${localParams.length}`);
        }

        extraConditions.push(renderedCondition);
        params.splice(0, params.length, ...localParams);
        return `WHERE ${extraConditions.join(' AND ')}`;
      },
    };
  }

  private normalizeCountRows(rows: Array<{ key: string; label: string | null; count: string | number }>): CountReportRow[] {
    return rows.map((row) => ({ key: row.key, label: row.label, count: Number(row.count) }));
  }

  private rowsToRecord(rows: CountReportRow[]): Record<string, number> {
    return rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.key] = row.count;
      return acc;
    }, {});
  }
}
