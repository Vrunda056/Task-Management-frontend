import {
  loginResponseSchema,
  refresh,
  type LoginResponse,
} from './auth.api';

const STORAGE_KEY = 'taskly_auth_session';

let session: LoginResponse | null = null;
let hydrated = false;
let sessionVersion = 0;
let refreshRequest: Promise<LoginResponse | null> | null = null;
const listeners = new Set<() => void>();

/**
 * Read the persisted session from localStorage.
 * Returns null on the server or if nothing is stored.
 */
function loadFromStorage(): LoginResponse | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? loginResponseSchema.parse(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

/**
 * Persist the session to localStorage (or remove it when null).
 */
function saveToStorage(nextSession: LoginResponse | null): void {
  if (typeof window === 'undefined') return;
  if (nextSession) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Decode the JWT payload (without verifying the signature — that's the
 * backend's job) and check whether the token is still valid.
 *
 * The `exp` claim is in seconds; Date.now() is in milliseconds.
 * We add a 30-second buffer so we don't try to use a token that's
 * about to expire in the next few moments.
 */
export function isAccessTokenValid(token: string | null | undefined): boolean {
  if (!token) return false;

  try {
    // JWT payloads use base64url encoding. Convert to standard base64
    // so atob() can decode it correctly.
    const base64 = token.split('.')[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const payload = JSON.parse(atob(base64)) as { exp?: unknown };

    return (
      typeof payload.exp === 'number' &&
      payload.exp * 1000 > Date.now() + 30_000
    );
  } catch {
    return false;
  }
}

export function getAuthSession(): LoginResponse | null {
  // Lazily hydrate from localStorage on the first client-side call.
  // After that, we keep using the in-memory reference so useSyncExternalStore
  // gets a stable snapshot and doesn't re-render in a loop.
  if (!hydrated && typeof window !== 'undefined') {
    session = loadFromStorage();
    hydrated = true;
  }
  return session;
}

export function subscribeToAuthSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setAuthSession(nextSession: LoginResponse | null): void {
  session = nextSession;
  saveToStorage(nextSession);
  sessionVersion += 1;
  listeners.forEach((listener) => listener());
}

export function refreshAuthSession(): Promise<LoginResponse | null> {
  if (refreshRequest) {
    return refreshRequest;
  }

  const versionAtStart = sessionVersion;
  refreshRequest = refresh()
    .then((nextSession) => {
      if (sessionVersion !== versionAtStart) {
        return session;
      }

      setAuthSession(nextSession);
      return nextSession;
    })
    .finally(() => {
      refreshRequest = null;
    });

  return refreshRequest;
}
