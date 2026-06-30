import type { InspectionFindingSeverityResponse, InspectionFindingTypeResponse } from '@aurelia/contracts';
import { httpGet } from '../http-client';

export function fetchInspectionFindingTypes(): Promise<InspectionFindingTypeResponse[]> {
  return httpGet<InspectionFindingTypeResponse[]>('/inspections/finding-catalogs/types');
}

export function fetchInspectionFindingSeverities(): Promise<InspectionFindingSeverityResponse[]> {
  return httpGet<InspectionFindingSeverityResponse[]>('/inspections/finding-catalogs/severities');
}

export const fetchInspectionFindingTypesLocalFirst = fetchInspectionFindingTypes;
export const fetchInspectionFindingSeveritiesLocalFirst = fetchInspectionFindingSeverities;
export const fetchInspectionFindingTypesFromApi = fetchInspectionFindingTypes;
export const fetchInspectionFindingSeveritiesFromApi = fetchInspectionFindingSeverities;
