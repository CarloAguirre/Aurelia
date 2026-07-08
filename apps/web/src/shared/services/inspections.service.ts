import type {
  AiSuggestRequest,
  AiSuggestResponse,
  AreaResponse,
  CreateEvidenceRequest,
  CreateInspectionFindingRequest,
  CompanyResponse,
  CreateInspectionRequest,
  EvidenceResponse,
  FileResponse,
  InspectionDashboardChartsResponse,
  InspectionDashboardCompanyAnalysisResponse,
  InspectionDashboardOpenFindingsResponse,
  InspectionDashboardSummaryResponse,
  InspectionFindingResponse,
  InspectionManagementKpisResponse,
  InspectionManagementTableResponse,
  InspectionChecklistTemplateResponse,
  InspectionFindingSeverityResponse,
  InspectionFindingTypeResponse,
  InspectionResponse,
  InspectionTypeResponse,
  MobileBootstrapResponse,
  SectorResponse,
  UpsertInspectionAnswerRequest,
  UserResponse,
} from '@aurelia/contracts';
import { AiSuggestType } from '@aurelia/contracts';
import { httpGet, httpPost, httpPostForm } from './http-client';

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

export function getResponsibleCompanies(): Promise<CompanyResponse[]> {
  return httpGet<CompanyResponse[]>('/organization/companies?isContractor=true');
}

function normalizeCompanies(input: CompanyResponse[]): CompanyResponse[] {
  const byId = new Map<string, CompanyResponse>();

  input.forEach((company) => {
    const id = (company.id ?? '').trim();
    const name = (company.name ?? '').trim();
    if (!id || !name) return;
    if (byId.has(id)) return;
    byId.set(id, { ...company, id, name });
  });

  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

export async function getDashboardFilterCompanies(): Promise<CompanyResponse[]> {
  try {
    const contractorCompanies = normalizeCompanies(await getResponsibleCompanies());
    if (contractorCompanies.length > 0) return contractorCompanies;
  } catch {
    // Ignore and continue with fallback sources.
  }

  try {
    const dashboardCompanies = normalizeCompanies(await getInspectionDashboardCompanies());
    if (dashboardCompanies.length > 0) return dashboardCompanies;
  } catch {
    // Ignore and continue with bootstrap fallback.
  }

  const bootstrap = await httpGet<MobileBootstrapResponse>('/mobile/bootstrap');
  const bootstrapContractors = normalizeCompanies((bootstrap.catalogs.companies ?? []).filter((company) => company.isContractor));
  return bootstrapContractors;
}

export function getOrganizationAreas(): Promise<AreaResponse[]> {
  return httpGet<AreaResponse[]>('/organization/areas');
}

export function getOrganizationSectors(areaId?: string | null): Promise<SectorResponse[]> {
  const query = areaId ? `?areaId=${encodeURIComponent(areaId)}` : '';
  return httpGet<SectorResponse[]>(`/organization/sectors${query}`);
}

export function listInspections(): Promise<InspectionResponse[]> {
  return httpGet<InspectionResponse[]>('/inspections');
}

export function getInspectionTypes(): Promise<InspectionTypeResponse[]> {
  return httpGet<InspectionTypeResponse[]>('/inspections/types');
}

export function getInspectionTemplates(): Promise<InspectionChecklistTemplateResponse[]> {
  return httpGet<InspectionChecklistTemplateResponse[]>('/inspections/templates');
}

export function getInspectionFindingTypes(): Promise<InspectionFindingTypeResponse[]> {
  return httpGet<InspectionFindingTypeResponse[]>('/inspections/finding-catalogs/types');
}

export function getInspectionFindingSeverities(): Promise<InspectionFindingSeverityResponse[]> {
  return httpGet<InspectionFindingSeverityResponse[]>('/inspections/finding-catalogs/severities');
}

function extractStatusCode(error: unknown): number | null {
  if (!(error instanceof Error)) return null;
  const match = error.message.match(/failed:\s*(\d{3})/i);
  if (!match) return null;
  const status = Number(match[1]);
  return Number.isFinite(status) ? status : null;
}

export async function getCompanyUsers(companyId: string): Promise<UserResponse[]> {
  const query = `?companyId=${encodeURIComponent(companyId)}`;
  try {
    return await httpGet<UserResponse[]>(`/users${query}`);
  } catch (error) {
    const status = extractStatusCode(error);
    if (status !== 403) throw error;

    const bootstrap = await httpGet<MobileBootstrapResponse>('/mobile/bootstrap');
    return (bootstrap.catalogs.users ?? []).filter(
      (user) => user.companyId === companyId || user.companies?.some((company) => company.id === companyId),
    );
  }
}

export function suggestCorrectiveMeasure(params: {
  area: string;
  sector: string;
  description: string;
}): Promise<AiSuggestResponse> {
  return httpPost<AiSuggestRequest, AiSuggestResponse>('/ai/suggest', {
    type: AiSuggestType.CORRECTIVE_MEASURE,
    context: params,
  });
}

export function suggestCompany(params: {
  area: string;
  sector: string;
  availableCompanies: string[];
}): Promise<AiSuggestResponse> {
  return httpPost<AiSuggestRequest, AiSuggestResponse>('/ai/suggest', {
    type: AiSuggestType.COMPANY_SUGGESTION,
    context: params,
  });
}

export function createInspection(payload: CreateInspectionRequest): Promise<InspectionResponse> {
  return httpPost<CreateInspectionRequest, InspectionResponse>('/inspections', payload);
}

export function upsertInspectionAnswer(
  inspectionId: string,
  payload: UpsertInspectionAnswerRequest,
): Promise<unknown> {
  return httpPost<UpsertInspectionAnswerRequest, unknown>(`/inspections/${inspectionId}/answers`, payload);
}

export function createInspectionFinding(
  inspectionId: string,
  payload: CreateInspectionFindingRequest,
): Promise<InspectionFindingResponse> {
  return httpPost<CreateInspectionFindingRequest, InspectionFindingResponse>(`/inspections/${inspectionId}/findings`, payload);
}

export function closeInspection(inspectionId: string, reason?: string): Promise<InspectionResponse> {
  return httpPost<{ reason?: string }, InspectionResponse>(`/inspections/${inspectionId}/close`, reason ? { reason } : {});
}

export function uploadFile(file: File, uploadedByUserId?: string | null): Promise<FileResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const query = uploadedByUserId ? `?uploadedByUserId=${encodeURIComponent(uploadedByUserId)}` : '';
  return httpPostForm<FileResponse>(`/files/upload${query}`, formData);
}

export function createEvidence(payload: CreateEvidenceRequest): Promise<EvidenceResponse> {
  return httpPost<CreateEvidenceRequest, EvidenceResponse>('/evidences', payload);
}

export function linkInspectionEvidence(
  inspectionId: string,
  evidenceId: string,
  relationType?: string,
): Promise<unknown> {
  return httpPost<{ relationType?: string }, unknown>(
    `/inspections/${inspectionId}/evidences/${evidenceId}/link`,
    relationType ? { relationType } : {},
  );
}
