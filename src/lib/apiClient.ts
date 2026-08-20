const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const TOKEN_KEY = 'gym_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

// Callback que se dispara en 401 (lo conecta tu AuthProvider)
let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(fn: () => void) {
  onUnauthorized = fn;
}

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function api<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    query?: Record<string, unknown>;
  } = {},
): Promise<T> {
  const { method = 'GET', body, query } = options;

  const url = new URL(path, API_URL);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    setToken(null);
    onUnauthorized?.();
  }

  if (!response.ok) {
    let message = `Error ${response.status}`;
    let details: unknown;
    try {
      const errorBody = await response.json();
      // message puede ser string o array (validación)
      message = Array.isArray(errorBody.message)
        ? errorBody.message.join(', ')
        : (errorBody.message ?? message);
      details = errorBody;
    } catch {
      /* sin body JSON */
    }
    throw new ApiError(response.status, message, details);
  }

  return (await response.json()) as T;
}

// Helpers tipados
export const get = <T>(path: string, query?: Record<string, unknown>) =>
  api<T>(path, { query });
export const post = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: 'POST', body });
export const patch = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: 'PATCH', body });
export const del = <T>(path: string) => api<T>(path, { method: 'DELETE' });

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Error de conexión';
}
