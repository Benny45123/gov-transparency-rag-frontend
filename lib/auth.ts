const AUTH_TOKEN_KEY = 'gov-rag-auth-token';

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function startGoogleOAuth(baseUrl: string = getApiBaseUrl()): Promise<void> {
  const response = await fetch(`${baseUrl}/auth/login/google`);
  if (!response.ok) {
    throw new Error(`Google OAuth launch failed (${response.status})`);
  }

  const data = (await response.json()) as { url?: string };
  if (!data.url) {
    throw new Error('Google OAuth URL missing from backend response');
  }

  window.location.assign(data.url);
}
