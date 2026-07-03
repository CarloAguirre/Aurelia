import { httpPost } from '../http-client';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  position: string | null;
  companyId: string | null;
  companyName: string | null;
  areaId: string | null;
  areaName: string | null;
  roles: string[];
  permissions: string[];
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return httpPost<{ email: string; password: string }, LoginResponse>('/auth/login', {
    email: email.trim().toLowerCase(),
    password,
  });
}

export function exchangeDesktopLaunch(code: string): Promise<LoginResponse> {
  return httpPost<{ ticket: string }, LoginResponse>('/auth/iframe-session', { ticket: code });
}
