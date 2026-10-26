import { refresh, type LoginResponse } from './auth.api';

let session: LoginResponse | null = null;
let sessionVersion = 0;
let refreshRequest: Promise<LoginResponse | null> | null = null;
const listeners = new Set<() => void>();

export function getAuthSession(): LoginResponse | null {
  return session;
}

export function subscribeToAuthSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setAuthSession(nextSession: LoginResponse | null): void {
  session = nextSession;
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
