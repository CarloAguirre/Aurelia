import type { Role } from '../../enums';
import type { ID } from '../../types/common';

export interface AuthUserResponse {
  id: ID;
  email: string;
  fullName: string;
  role: Role;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUserResponse;
}
