import { Role, type LoginResponse } from '@aurelia/contracts';

type SessionUser = LoginResponse['user'];

const sprAreaRoles = new Set<Role>([
  Role.ADMIN,
  Role.SPR_AREA_MANAGER,
  Role.SPR_SUSTAINABILITY_SPECIALIST,
  Role.SPR_ENVIRONMENT_MANAGER,
]);

export function resolveSessionUserRoles(user: SessionUser | null | undefined): Role[] {
  return user?.roles ?? [];
}

export function canAccessSprForm(roles: Role[]): boolean {
  return roles.some((role) => role === Role.ADMIN || role === Role.SPR_RESPONSIBLE);
}

export function canAccessSprArea(roles: Role[]): boolean {
  return roles.some((role) => sprAreaRoles.has(role));
}

export function resolveSprDefaultRoute(roles: Role[]): '/spr' | '/spr/mi-area' {
  if (canAccessSprArea(roles)) return '/spr/mi-area';
  if (canAccessSprForm(roles)) return '/spr';
  return '/spr';
}
