import type {
  CreateInspectionRequest,
  InspectionDashboardSummaryResponse,
  InspectionResponse,
} from '@aurelia/contracts';
import { httpGet, httpPost } from './http-client';

export function getInspectionDashboardSummary(): Promise<InspectionDashboardSummaryResponse> {
  return httpGet<InspectionDashboardSummaryResponse>('/inspections/dashboard/summary');
}

export function listInspections(): Promise<InspectionResponse[]> {
  return httpGet<InspectionResponse[]>('/inspections');
}

export function createInspection(payload: CreateInspectionRequest): Promise<InspectionResponse> {
  return httpPost<CreateInspectionRequest, InspectionResponse>('/inspections', payload);
}
