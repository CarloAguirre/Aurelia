import type { AuthUserResponse } from '@aurelia/contracts';

const TOKEN_KEY = 'aurelia_token';
const USER_KEY = 'aurelia_user';

export interface StoredSession {
  token: string;
  user: AuthUserResponse;
}

export function readStoredSession(): StoredSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = window.localStorage.getItem(TOKEN_KEY);
  const userRaw = window.localStorage.getItem(USER_KEY);

  if (!token || !userRaw) {
    return null;
  }

  try {
    return {
      token,
      user: JSON.parse(userRaw) as AuthUserResponse,
    };
  } catch {
    return null;
  }
}

export function writeStoredSession(session: StoredSession): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, session.token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function clearStoredSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function readStoredToken(): string | null {
  return readStoredSession()?.token ?? null;
}