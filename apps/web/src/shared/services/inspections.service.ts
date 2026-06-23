import type { CreateInspectionRequest, InspectionResponse } from '@aurelia/contracts';
import { httpGet, httpPost } from './http-client';

export function listInspections(): Promise<InspectionResponse[]> {
  return httpGet<InspectionResponse[]>('/inspections');
}

export function createInspection(payload: CreateInspectionRequest): Promise<InspectionResponse> {
  return httpPost<CreateInspectionRequest, InspectionResponse>('/inspections', payload);
}
