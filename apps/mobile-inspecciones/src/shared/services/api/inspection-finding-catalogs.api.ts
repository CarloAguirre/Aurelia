import type { InspectionFindingSeverityResponse, InspectionFindingTypeResponse } from '@aurelia/contracts';
import { getMobileBootstrapLocalFirst } from '../../offline/local-catalogs';
import { httpGet } from '../http-client';

export async function fetchInspectionFindingTypesLocalFirst(): Promise<InspectionFindingTypeResponse[]> {
  const bootstrap = await getMobileBootstrapLocalFirst();
  return bootstrap.catalogs.findingTypes ?? [];
}

export async function fetchInspectionFindingSeveritiesLocalFirst(): Promise<InspectionFindingSeverityResponse[]> {
  const bootstrap = await getMobileBootstrapLocalFirst();
  return bootstrap.catalogs.findingSeverities ?? [];
}

export function fetchInspectionFindingTypes(): Promise<InspectionFindingTypeResponse[]> {
  return httpGet<InspectionFindingTypeResponse[]>('/inspections/finding-catalogs/types');
}

export function fetchInspectionFindingSeverities(): Promise<InspectionFindingSeverityResponse[]> {
  return httpGet<InspectionFindingSeverityResponse[]>('/inspections/finding-catalogs/severities');
}

export const fetchInspectionFindingTypesFromApi = fetchInspectionFindingTypes;
export const fetchInspectionFindingSeveritiesFromApi = fetchInspectionFindingSeverities;
