import { refreshAuthSession } from '../auth/auth-session';

export async function authenticatedFetch(
  accessToken: string | null,
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  if (!accessToken) {
    throw new Error('You must be signed in to make this request.');
  }

  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);

  const response = await fetch(input, { ...init, headers });
  if (response.status !== 401) {
    return response;
  }

  const refreshedSession = await refreshAuthSession();
  if (!refreshedSession) {
    return response;
  }

  const retryHeaders = new Headers(init?.headers);
  retryHeaders.set('Authorization', `Bearer ${refreshedSession.accessToken}`);
  return fetch(input, { ...init, headers: retryHeaders });
}
