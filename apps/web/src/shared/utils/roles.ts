import { Role } from '@aurelia/contracts';

const roleLabels: Record<Role, string> = {
  [Role.ADMIN]: 'Administrador',
  [Role.SUPERVISOR]: 'Supervisor',
  [Role.INSPECTOR]: 'Inspector',
  [Role.APPROVER]: 'Aprobador',
  [Role.VIEWER]: 'Visualizador',
};

export function roleLabel(role: Role): string {
  return roleLabels[role];
}

export function formatUserInitials(fullName: string): string {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const firstPart = parts[0];
  const lastPart = parts[parts.length - 1];

  if (!firstPart) return '?';
  if (parts.length === 1 || !lastPart) return firstPart.slice(0, 2).toUpperCase();

  const first = firstPart[0] ?? '';
  const last = lastPart[0] ?? '';
  return `${first}${last}`.toUpperCase();
}

export function formatPrimaryRoleLabel(roles: Role[]): string {
  const primary = roles[0];
  return primary ? roleLabel(primary) : 'Sin rol';
}

export function canApprove(role: Role): boolean {
  return role === Role.ADMIN || role === Role.APPROVER || role === Role.SUPERVISOR;
}
