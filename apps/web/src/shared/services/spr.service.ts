import type {
  CreateSprMonthlyRecordRequest,
  EvidenceLinkResponse,
  EvidenceResponse,
  LinkSprRecordEvidenceRequest,
  SprMonthlyRecordResponse,
  SprParameterAreaAssignmentResponse,
  SprParameterResponse,
  SprRecordActionRequest,
  SprRecordApprovalResponse,
  SprUnitResponse,
  UpdateSprMonthlyRecordRequest,
} from '@aurelia/contracts';
import { httpGet, httpPatch, httpPost } from './http-client';

// GAP: no existe todavia un contrato de query para GET /spr/monthly-records.
// Se tipa localmente en el frontend (igual que InspectionManagementTableParams en inspections)
// hasta que se agregue el request a @aurelia/contracts.
export interface SprMonthlyRecordsQuery {
  parameterId?: string;
  areaId?: string;
  status?: string;
  periodYear?: number;
  periodMonth?: number;
}

function buildMonthlyRecordsQuery(query?: SprMonthlyRecordsQuery) {
  if (!query) return '';
  const searchParams = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, String(value));
  });
  const serialized = searchParams.toString();
  return serialized ? `?${serialized}` : '';
}

export function getSprParameters(): Promise<SprParameterResponse[]> {
  return httpGet<SprParameterResponse[]>('/spr/parameters');
}

export function getSprAssignments(): Promise<SprParameterAreaAssignmentResponse[]> {
  return httpGet<SprParameterAreaAssignmentResponse[]>('/spr/assignments');
}

export function getSprUnits(): Promise<SprUnitResponse[]> {
  return httpGet<SprUnitResponse[]>('/spr/units');
}

export function getSprMonthlyRecords(query?: SprMonthlyRecordsQuery): Promise<SprMonthlyRecordResponse[]> {
  return httpGet<SprMonthlyRecordResponse[]>(`/spr/monthly-records${buildMonthlyRecordsQuery(query)}`);
}

export function getSprMonthlyRecord(recordId: string): Promise<SprMonthlyRecordResponse> {
  return httpGet<SprMonthlyRecordResponse>(`/spr/monthly-records/${recordId}`);
}

export function createSprMonthlyRecord(payload: CreateSprMonthlyRecordRequest): Promise<SprMonthlyRecordResponse> {
  return httpPost<CreateSprMonthlyRecordRequest, SprMonthlyRecordResponse>('/spr/monthly-records', payload);
}

export function updateSprMonthlyRecord(
  recordId: string,
  payload: UpdateSprMonthlyRecordRequest,
): Promise<SprMonthlyRecordResponse> {
  return httpPatch<UpdateSprMonthlyRecordRequest, SprMonthlyRecordResponse>(`/spr/monthly-records/${recordId}`, payload);
}

export function submitSprMonthlyRecord(
  recordId: string,
  payload: SprRecordActionRequest = {},
): Promise<SprMonthlyRecordResponse> {
  return httpPost<SprRecordActionRequest, SprMonthlyRecordResponse>(`/spr/monthly-records/${recordId}/submit`, payload);
}

export function getSprRecordEvidences(recordId: string): Promise<EvidenceResponse[]> {
  return httpGet<EvidenceResponse[]>(`/spr/monthly-records/${recordId}/evidences`);
}

export function getSprRecordApprovals(recordId: string): Promise<SprRecordApprovalResponse[]> {
  return httpGet<SprRecordApprovalResponse[]>(`/spr/monthly-records/${recordId}/approvals`);
}

export function linkSprRecordEvidence(
  recordId: string,
  evidenceId: string,
  payload: LinkSprRecordEvidenceRequest = {},
): Promise<EvidenceLinkResponse> {
  return httpPost<LinkSprRecordEvidenceRequest, EvidenceLinkResponse>(
    `/spr/monthly-records/${recordId}/evidences/${evidenceId}/link`,
    payload,
  );
}
