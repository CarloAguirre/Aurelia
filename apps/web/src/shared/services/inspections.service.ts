import type {
  CompanyResponse,
  CreateInspectionRequest,
  InspectionDashboardChartsResponse,
  InspectionDashboardCompanyAnalysisResponse,
  InspectionDashboardOpenFindingsResponse,
  InspectionDashboardSummaryResponse,
  InspectionManagementKpisResponse,
  InspectionManagementTableResponse,
  InspectionResponse,
} from '@aurelia/contracts';
import { httpGet, httpPost } from './http-client';

export type InspectionDashboardPeriod = 'year' | 'q1' | 'q2' | 'q3' | 'q4' | 'm1' | 'm2' | 'm3' | 'm4' | 'm5' | 'm6' | 'm7' | 'm8' | 'm9' | 'm10' | 'm11' | 'm12';
export type InspectionManagementPageSize = 10 | 25 | 50;

export interface InspectionDashboardQueryParams {
  year: number;
  period: InspectionDashboardPeriod;
  companyId?: string | null;
}

export interface InspectionManagementTableParams {
  page: number;
  pageSize: InspectionManagementPageSize;
  id?: string;
  date?: string;
  inspector?: string;
  area?: string;
  company?: string;
  type?: string;
  urgency?: string;
  count?: string;
  obs?: string;
  daysMin?: string;
  daysMax?: string;
  closure?: string;
}

function buildDashboardQuery(params?: InspectionDashboardQueryParams) {
  if (!params) return '';
  const searchParams = new URLSearchParams({ year: String(params.year), period: params.period });
  if (params.companyId) searchParams.set('companyId', params.companyId);
  return `?${searchParams.toString()}`;
}

function buildManagementTableQuery(params: InspectionManagementTableParams) {
  const searchParams = new URLSearchParams({ page: String(params.page), pageSize: String(params.pageSize) });
  Object.entries(params).forEach(([key, value]) => {
    if (key === 'page' || key === 'pageSize') return;
    if (typeof value === 'string' && value.trim().length > 0) searchParams.set(key, value.trim());
  });
  return `?${searchParams.toString()}`;
}

function normalizeManagementInspectionType(type: string) {
  const value = type.trim().toLowerCase();
  if (value.includes('check') || value.includes('normativ') || value.includes('regulatory') || value.includes('regulatoria')) return 'Checklist';
  if (value.includes('hallazgo') || value.includes('ambiental') || value.includes('environmental')) return 'Hallazgo';
  return type;
}

export function getInspectionManagementKpis(): Promise<InspectionManagementKpisResponse> {
  return httpGet<InspectionManagementKpisResponse>('/inspections/dashboard/management-kpis');
}

export async function getInspectionManagementTable(params: InspectionManagementTableParams): Promise<InspectionManagementTableResponse> {
  const response = await httpGet<InspectionManagementTableResponse>(`/inspections/dashboard/management-table${buildManagementTableQuery(params)}`);
  return {
    ...response,
    rows: response.rows.map((row) => ({
      ...row,
      type: normalizeManagementInspectionType(row.type),
    })),
    filterOptions: {
      ...response.filterOptions,
      types: response.filterOptions.types.map(normalizeManagementInspectionType),
    },
  };
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
