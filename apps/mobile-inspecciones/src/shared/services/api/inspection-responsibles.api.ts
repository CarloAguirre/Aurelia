import type { CompanyResponse, UserResponse } from '@aurelia/contracts';
import { getMobileBootstrapLocalFirst } from '../../offline/local-catalogs';
import { httpGet } from '../http-client';

export function fetchResponsibleCompanies(): Promise<CompanyResponse[]> {
  return httpGet<CompanyResponse[]>('/organization/companies?isContractor=true');
}

export function fetchResponsibleUsers(companyId: string): Promise<UserResponse[]> {
  return httpGet<UserResponse[]>(`/users?companyId=${encodeURIComponent(companyId)}`);
}

export async function fetchResponsibleCompaniesLocalFirst(): Promise<CompanyResponse[]> {
  const remote = await fetchResponsibleCompanies().then(
    (items) => items,
    () => null,
  );

  if (remote) return remote;

  const bootstrap = await getMobileBootstrapLocalFirst();
  return (bootstrap.catalogs.companies ?? []).filter((company) => company.isContractor);
}

export async function fetchResponsibleUsersLocalFirst(companyId: string): Promise<UserResponse[]> {
  const remote = await fetchResponsibleUsers(companyId).then(
    (items) => items,
    () => null,
  );

  if (remote) return remote;

  const bootstrap = await getMobileBootstrapLocalFirst();
  return (bootstrap.catalogs.users ?? []).filter((user) => user.companyId === companyId || user.companies?.some((company) => company.id === companyId));
}
