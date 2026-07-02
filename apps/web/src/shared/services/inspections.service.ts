import type {
  CreateInspectionRequest,
  InspectionDashboardChartsResponse,
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

export function listInspections(): Promise<InspectionResponse[]> {
  return httpGet<InspectionResponse[]>('/inspections');
}

export function createInspection(payload: CreateInspectionRequest): Promise<InspectionResponse> {
  return httpPost<CreateInspectionRequest, InspectionResponse>('/inspections', payload);
}
