import { Role, type LoginResponse } from '@aurelia/contracts';

// DECISION TEMPORAL (Nico, sin confirmacion de Alexis/Carlo):
// El backend ya devuelve user.roles[] en login, pero AuthUserResponse del contrato
// aun expone role singular. Este modulo lee roles[] en runtime para SPR sin tocar
// apps/api ni packages/contracts hasta la respuesta oficial (pregunta E1).

type SessionUser = LoginResponse['user'] & { roles?: Role[] };

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

export function resolveSprDefaultRoute(roles: Role[]): '/spr' | '/spr/mi-area' {
  if (canAccessSprArea(roles)) return '/spr/mi-area';
  if (canAccessSprForm(roles)) return '/spr';
  return '/spr';
}
