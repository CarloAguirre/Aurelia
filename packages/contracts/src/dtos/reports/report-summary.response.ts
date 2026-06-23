export interface ReportSummaryResponse {
  totalInspections: number;
  totalIncidents: number;
  openIncidents: number;
  byRiskLevel: Record<string, number>;
  byStatus: Record<string, number>;
}
