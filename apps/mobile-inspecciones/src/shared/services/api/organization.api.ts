import type { AreaResponse, CompanyResponse, SectorResponse } from '@aurelia/contracts';
import { httpGet } from '../http-client';

export function fetchAreas(): Promise<AreaResponse[]> {
  return httpGet<AreaResponse[]>('/organization/areas');
}

export function fetchSectors(areaId: string): Promise<SectorResponse[]> {
  return httpGet<SectorResponse[]>(`/organization/sectors?areaId=${areaId}`);
}

export function fetchCompanies(isContractor?: boolean): Promise<CompanyResponse[]> {
  const q = isContractor !== undefined ? `?isContractor=${isContractor}` : '';
  return httpGet<CompanyResponse[]>(`/organization/companies${q}`);
}
