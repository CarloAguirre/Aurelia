import { httpPost } from './http-client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
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
  };
}

const TOKEN_KEY = 'aurelia_token';
const USER_KEY = 'aurelia_user';

export function login(payload: LoginRequest): Promise<LoginResponse> {
  return httpPost<LoginRequest, LoginResponse>('/auth/login', payload);
}

export function saveSession(response: LoginResponse): void {
  localStorage.setItem(TOKEN_KEY, response.token);
  localStorage.setItem(USER_KEY, JSON.stringify(response.user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
