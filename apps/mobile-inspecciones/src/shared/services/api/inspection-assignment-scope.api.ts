import type { InspectionAssignmentScopeResponse } from '@aurelia/contracts';
import type { AuthUser } from './auth.api';
import { httpGet } from '../http-client';

export interface MobileInspectionAssignmentScope extends InspectionAssignmentScopeResponse {
  inspectorCompanyName: string | null;
}

function isPrincipalCompanyUser(user: AuthUser): boolean {
  const companyName = user.companyName?.trim().toLowerCase() ?? '';
  return user.roles.includes('ADMIN') || user.email.toLowerCase().endsWith('@goldfields.com') || companyName.includes('gold field');
}

function fallbackScope(user: AuthUser): MobileInspectionAssignmentScope {
  const canSelectCompany = isPrincipalCompanyUser(user);
  return {
    canSelectCompany,
    companyId: canSelectCompany ? null : user.companyId,
    companyName: canSelectCompany ? null : user.companyName,
    inspectorCompanyName: user.companyName,
  };
}

export async function fetchInspectionAssignmentScopeLocalFirst(user: AuthUser): Promise<MobileInspectionAssignmentScope> {
  const remote = await httpGet<InspectionAssignmentScopeResponse>('/inspections/assignment-scope').then(
    (scope) => scope,
    () => null,
  );

  if (!remote) return fallbackScope(user);

  return {
    ...remote,
    companyId: remote.canSelectCompany ? null : remote.companyId ?? user.companyId,
    companyName: remote.canSelectCompany ? null : remote.companyName ?? user.companyName,
    inspectorCompanyName: user.companyName,
  };
}
