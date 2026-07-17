import { Role, type LoginResponse } from '@aurelia/contracts';

type SessionUser = LoginResponse['user'];

const sprAreaRoles = new Set<Role>([
  Role.ADMIN,
  Role.SPR_AREA_MANAGER,
  Role.SPR_SUSTAINABILITY_SPECIALIST,
  Role.SPR_ENVIRONMENT_MANAGER,
]);

export type SprDefaultRoute = '/spr' | '/spr/mi-area' | '/spr/reporte';

export function resolveSessionUserRoles(user: SessionUser | null | undefined): Role[] {
  return user?.roles ?? [];
}

export function canAccessSprForm(roles: Role[]): boolean {
  return roles.some((role) => role === Role.ADMIN || role === Role.SPR_RESPONSIBLE);
}

export function canAccessSprArea(roles: Role[]): boolean {
  return roles.some((role) => sprAreaRoles.has(role));
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
