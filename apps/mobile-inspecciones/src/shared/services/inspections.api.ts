import type { CreateInspectionFindingRequest, CreateInspectionRequest, InspectionChecklistAnswerResponse, InspectionFindingResponse, InspectionResponse, UpsertInspectionAnswerRequest } from '@aurelia/contracts';
import { httpGet, httpPost } from './http-client';

export function fetchInspections(): Promise<InspectionResponse[]> {
  return httpGet<InspectionResponse[]>('/inspections');
}

export function submitInspection(payload: CreateInspectionRequest): Promise<InspectionResponse> {
  return httpPost<CreateInspectionRequest, InspectionResponse>('/inspections', payload);
}

export function submitInspectionAnswer(inspectionId: string, payload: UpsertInspectionAnswerRequest): Promise<InspectionChecklistAnswerResponse> {
  return httpPost<UpsertInspectionAnswerRequest, InspectionChecklistAnswerResponse>(`/inspections/${inspectionId}/answers`, payload);
}

export function submitInspectionFinding(inspectionId: string, payload: CreateInspectionFindingRequest): Promise<InspectionFindingResponse> {
  return httpPost<CreateInspectionFindingRequest, InspectionFindingResponse>(`/inspections/${inspectionId}/findings`, payload);
}

export function closeInspection(inspectionId: string, reason?: string): Promise<InspectionResponse> {
  return httpPost<{ reason?: string }, InspectionResponse>(`/inspections/${inspectionId}/close`, { reason });
}
