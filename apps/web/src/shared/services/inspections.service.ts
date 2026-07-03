import type {
  CreateInspectionRequest,
  InspectionDashboardChartsResponse,
  InspectionDashboardCompanyAnalysisResponse,
  InspectionDashboardOpenFindingsResponse,
  InspectionDashboardSummaryResponse,
  InspectionResponse,
} from '@aurelia/contracts';
import { httpGet, httpPost } from './http-client';

export function getInspectionDashboardSummary(): Promise<InspectionDashboardSummaryResponse> {
  return httpGet<InspectionDashboardSummaryResponse>('/inspections/dashboard/summary');
}

export function getInspectionDashboardCharts(): Promise<InspectionDashboardChartsResponse> {
  return httpGet<InspectionDashboardChartsResponse>('/inspections/dashboard/charts');
}

export function getInspectionDashboardCompanyAnalysis(): Promise<InspectionDashboardCompanyAnalysisResponse> {
  return httpGet<InspectionDashboardCompanyAnalysisResponse>('/inspections/dashboard/company-analysis');
}

export function getInspectionDashboardOpenFindings(): Promise<InspectionDashboardOpenFindingsResponse> {
  return httpGet<InspectionDashboardOpenFindingsResponse>('/inspections/dashboard/open-findings');
}

export function listInspections(): Promise<InspectionResponse[]> {
  return httpGet<InspectionResponse[]>('/inspections');
}

export function createInspection(payload: CreateInspectionRequest): Promise<InspectionResponse> {
  return httpPost<CreateInspectionRequest, InspectionResponse>('/inspections', payload);
}
