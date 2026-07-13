import type { InspectionDetailResponse, InspectionFindingResponse, UpdateInspectionFindingRequest } from '@aurelia/contracts';
import { httpGet, httpPatch } from './http-client';

export function getInspectionDetail(inspectionId: string): Promise<InspectionDetailResponse> {
  return httpGet<InspectionDetailResponse>(`/inspections/${encodeURIComponent(inspectionId)}/detail`);
}

export function updateInspectionFinding(
  findingId: string,
  payload: UpdateInspectionFindingRequest,
): Promise<InspectionFindingResponse> {
  return httpPatch<UpdateInspectionFindingRequest, InspectionFindingResponse>(`/inspections/findings/${encodeURIComponent(findingId)}`, payload);
}
