import type {
  CreateInspectionFindingRequest,
  CreateInspectionRequest,
  InspectionChecklistAnswerResponse,
  InspectionDetailResponse,
  InspectionFindingResponse,
  InspectionResponse,
  UpdateInspectionFindingRequest,
  UpsertInspectionAnswerRequest,
} from '@aurelia/contracts';
import { httpGet, httpPatch, httpPost } from './http-client';

export function fetchInspections(): Promise<InspectionResponse[]> {
  return httpGet<InspectionResponse[]>('/inspections');
}

export function fetchInspectionDetail(inspectionId: string): Promise<InspectionDetailResponse> {
  return httpGet<InspectionDetailResponse>(`/inspections/${inspectionId}/detail`);
}

export function updateInspectionFinding(findingId: string, payload: UpdateInspectionFindingRequest): Promise<InspectionFindingResponse> {
  return httpPatch<UpdateInspectionFindingRequest, InspectionFindingResponse>(`/inspections/findings/${findingId}`, payload);
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

export function fetchInspectionFindings(inspectionId: string): Promise<InspectionFindingResponse[]> {
  return httpGet<InspectionFindingResponse[]>(`/inspections/${inspectionId}/findings`);
}

export function closeInspection(inspectionId: string, reason?: string): Promise<InspectionResponse> {
  return httpPost<{ reason?: string }, InspectionResponse>(`/inspections/${inspectionId}/close`, { reason });
}
