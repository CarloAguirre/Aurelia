import type {
  CompanyResponse,
  CreateInspectionRequest,
  InspectionDashboardChartsResponse,
  InspectionDashboardCompanyAnalysisResponse,
  InspectionDashboardOpenFindingsResponse,
  InspectionDashboardSummaryResponse,
  InspectionManagementKpisResponse,
  InspectionResponse,
} from '@aurelia/contracts';
import { httpGet, httpPost } from './http-client';

export type InspectionDashboardPeriod = 'year' | 'q1' | 'q2' | 'q3' | 'q4' | 'm1' | 'm2' | 'm3' | 'm4' | 'm5' | 'm6' | 'm7' | 'm8' | 'm9' | 'm10' | 'm11' | 'm12';

export interface InspectionDashboardQueryParams {
  year: number;
  period: InspectionDashboardPeriod;
  companyId?: string | null;
}

function buildDashboardQuery(params?: InspectionDashboardQueryParams) {
  if (!params) return '';
  const searchParams = new URLSearchParams({ year: String(params.year), period: params.period });
  if (params.companyId) searchParams.set('companyId', params.companyId);
  return `?${searchParams.toString()}`;
}

export function getInspectionManagementKpis(): Promise<InspectionManagementKpisResponse> {
  return httpGet<InspectionManagementKpisResponse>('/inspections/dashboard/management-kpis');
}

export function getInspectionDashboardSummary(params?: InspectionDashboardQueryParams): Promise<InspectionDashboardSummaryResponse> {
  return httpGet<InspectionDashboardSummaryResponse>(`/inspections/dashboard/filtered-summary${buildDashboardQuery(params)}`);
}

export function getInspectionDashboardCharts(params?: InspectionDashboardQueryParams): Promise<InspectionDashboardChartsResponse> {
  return httpGet<InspectionDashboardChartsResponse>(`/inspections/dashboard/charts${buildDashboardQuery(params)}`);
}

export function getInspectionDashboardCompanyAnalysis(params?: InspectionDashboardQueryParams): Promise<InspectionDashboardCompanyAnalysisResponse> {
  return httpGet<InspectionDashboardCompanyAnalysisResponse>(`/inspections/dashboard/company-analysis${buildDashboardQuery(params)}`);
}

export function getInspectionDashboardOpenFindings(params?: InspectionDashboardQueryParams): Promise<InspectionDashboardOpenFindingsResponse> {
  return httpGet<InspectionDashboardOpenFindingsResponse>(`/inspections/dashboard/open-findings${buildDashboardQuery(params)}`);
}

export function getInspectionDashboardCompanies(): Promise<CompanyResponse[]> {
  return httpGet<CompanyResponse[]>('/organization/companies');
}

export function listInspections(): Promise<InspectionResponse[]> {
  return httpGet<InspectionResponse[]>('/inspections');
}

export function createInspection(payload: CreateInspectionRequest): Promise<InspectionResponse> {
  return httpPost<CreateInspectionRequest, InspectionResponse>('/inspections', payload);
}
