import { httpGet } from '../http-client';

export interface InspectionTypeResponse {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: string;
}

export function fetchInspectionTypes(): Promise<InspectionTypeResponse[]> {
  return httpGet<InspectionTypeResponse[]>('/inspections/types');
}
