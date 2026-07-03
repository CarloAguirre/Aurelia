export const INSPECTION_DASHBOARD_PERIODS = ['year', 'q1', 'q2', 'q3', 'q4', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10', 'm11', 'm12'] as const;

export type InspectionDashboardPeriod = (typeof INSPECTION_DASHBOARD_PERIODS)[number];

export interface InspectionDashboardFilterQuery {
  year?: number | string;
  period?: InspectionDashboardPeriod | string;
  companyId?: string | null;
}
