import { Role, type LoginResponse } from '@aurelia/contracts';

type SessionUser = LoginResponse['user'];

export type SprDefaultRoute = '/spr' | '/spr/mi-area' | '/spr/reporte';

export function resolveSessionUserRoles(user: SessionUser | null | undefined): Role[] {
  return user?.roles ?? [];
}

/** Responsable de área — Mi formulario SPR. */
export function canAccessSprForm(roles: Role[]): boolean {
  return roles.some((role) => role === Role.ADMIN || role === Role.SPR_RESPONSIBLE);
}

/** Gerente de área — Mi área SPR. */
export function canAccessSprArea(roles: Role[]): boolean {
  return roles.some((role) => role === Role.ADMIN || role === Role.SPR_AREA_MANAGER);
}

/** Especialista / Gerente MA — Dashboard y Reporte SPR consolidado. */
export function canAccessSprReport(roles: Role[]): boolean {
  return roles.some(
    (role) =>
      role === Role.SPR_SUSTAINABILITY_SPECIALIST || role === Role.SPR_ENVIRONMENT_MANAGER,
  );
}

/** Cualquier rol SPR (formulario, área o reporte) — trazabilidad del ciclo. */
export function canAccessSprTraceability(roles: Role[]): boolean {
  return canAccessSprForm(roles) || canAccessSprArea(roles) || canAccessSprReport(roles) || roles.includes(Role.ADMIN);
}

export function resolveSprDefaultRoute(roles: Role[]): SprDefaultRoute {
  if (canAccessSprReport(roles)) return '/spr/reporte';
  if (canAccessSprArea(roles)) return '/spr/mi-area';
  if (canAccessSprForm(roles)) return '/spr';
  return '/spr';
}
