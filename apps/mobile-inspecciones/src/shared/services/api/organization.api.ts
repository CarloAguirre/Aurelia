import { httpGet } from '../http-client';

export interface AreaResponse {
  id: string;
  code: string;
  name: string;
  status: string;
}

export interface SectorResponse {
  id: string;
  code: string;
  name: string;
  status: string;
}

export interface CompanyResponse {
  id: string;
  code: string | null;
  name: string;
  isContractor: boolean;
  status: string;
}

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
