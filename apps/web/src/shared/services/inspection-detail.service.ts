import type { InspectionDetailResponse } from '@aurelia/contracts';
import { httpGet } from './http-client';

export function getInspectionDetail(inspectionId: string): Promise<InspectionDetailResponse> {
  return httpGet<InspectionDetailResponse>(`/inspections/${encodeURIComponent(inspectionId)}/detail`);
}
