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

export function canApprove(role: Role): boolean {
  return role === Role.ADMIN || role === Role.APPROVER || role === Role.SUPERVISOR;
}
