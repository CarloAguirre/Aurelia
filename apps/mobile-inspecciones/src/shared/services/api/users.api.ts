import { httpGet } from '../http-client';

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  position: string | null;
  isActive: boolean;
}

export function fetchUsers(filters?: {
  companyId?: string;
  role?: string;
}): Promise<UserResponse[]> {
  const params = new URLSearchParams();
  if (filters?.companyId) params.set('companyId', filters.companyId);
  if (filters?.role) params.set('role', filters.role);
  const q = params.toString() ? `?${params.toString()}` : '';
  return httpGet<UserResponse[]>(`/users${q}`);
}
