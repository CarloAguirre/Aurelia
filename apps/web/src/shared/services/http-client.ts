import { readStoredToken } from './session-storage';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

function buildHeaders(init?: HeadersInit): HeadersInit {
  const headers = new Headers(init);
  const token = readStoredToken();

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

export async function httpGet<TResponse>(path: string): Promise<TResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: buildHeaders(),
  });
  if (!response.ok) {
    const details = (await response.text()).trim();
    throw new Error(`GET ${path} failed: ${response.status}${details ? ` - ${details}` : ''}`);
  }
  return (await response.json()) as TResponse;
}

export async function httpPost<TRequest, TResponse>(
  path: string,
  body: TRequest,
): Promise<TResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const details = (await response.text()).trim();
    throw new Error(`POST ${path} failed: ${response.status}${details ? ` - ${details}` : ''}`);
  }
  return (await response.json()) as TResponse;
}

export async function httpPostForm<TResponse>(path: string, body: FormData): Promise<TResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders(),
    body,
  });
  if (!response.ok) {
    const details = (await response.text()).trim();
    throw new Error(`POST ${path} failed: ${response.status}${details ? ` - ${details}` : ''}`);
  }
  return (await response.json()) as TResponse;
}
