import type { AuthUserResponse, LoginRequest, LoginResponse, MeResponse } from '@aurelia/contracts';
import { httpGet, httpPost } from './http-client';
import { clearStoredSession, readStoredSession, writeStoredSession } from './session-storage';

type LoginApiResponse = {
  accessToken?: string;
  token?: string;
  user: AuthUserResponse;
};

function normalizeLoginResponse(response: LoginApiResponse): LoginResponse {
  const accessToken = response.accessToken ?? response.token;

  if (!accessToken) {
    throw new Error('Login response missing access token');
  }

  return {
    accessToken,
    user: response.user,
  };
}

export function login(payload: LoginRequest): Promise<LoginResponse> {
  return httpPost<LoginRequest, LoginApiResponse>('/auth/login', payload).then(normalizeLoginResponse);
}

export function getMe(): Promise<MeResponse> {
  return httpGet<MeResponse>('/me');
}

export function saveSession(response: LoginResponse): void {
  writeStoredSession({ token: response.accessToken, user: response.user });
}

export function clearSession(): void {
  clearStoredSession();
}

export function getToken(): string | null {
  return readStoredSession()?.token ?? null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getStoredUser(): LoginResponse['user'] | null {
  return readStoredSession()?.user ?? null;
}
