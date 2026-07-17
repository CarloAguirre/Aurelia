import { Role, type LoginResponse } from '@aurelia/contracts';

// DECISION TEMPORAL (Nico, sin confirmacion de Alexis/Carlo):
// El backend ya devuelve user.roles[] en login, pero AuthUserResponse del contrato
// aun expone role singular. Este modulo lee roles[] en runtime para SPR sin tocar
// apps/api ni packages/contracts hasta la respuesta oficial (pregunta E1).

type SessionUser = LoginResponse['user'] & { roles?: Role[] };

export type SprDefaultRoute = '/spr' | '/spr/mi-area' | '/spr/reporte';

export function resolveSessionUserRoles(user: SessionUser | null | undefined): Role[] {
  if (!user) return [];

  if (Array.isArray(user.roles) && user.roles.length > 0) {
    return user.roles;
  }

  if (user.role) {
    return [user.role];
  }

  return [];
}

export function canAccessSprForm(roles: Role[]): boolean {
  return roles.includes(Role.INSPECTOR);
}

export function canAccessSprArea(roles: Role[]): boolean {
  return roles.some((role) => role === Role.SUPERVISOR || role === Role.ADMIN);
}

/** Solo el rol SUSTAINABILITY_SPECIALIST (Dashboard / Reporte SPR consolidado). */
export function canAccessSprReport(roles: Role[]): boolean {
  return roles.includes(Role.SUSTAINABILITY_SPECIALIST);
}

export function resolveSprDefaultRoute(roles: Role[]): SprDefaultRoute {
  if (canAccessSprReport(roles)) return '/spr/reporte';
  if (canAccessSprArea(roles)) return '/spr/mi-area';
  if (canAccessSprForm(roles)) return '/spr';
  return '/spr';
}
