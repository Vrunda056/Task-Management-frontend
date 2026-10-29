'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {
  login as requestLogin,
  logout as requestLogout,
  type LoginInput,
  type LoginResponse,
} from './auth.api';
import {
  getAuthSession,
  isAccessTokenValid,
  refreshAuthSession,
  setAuthSession,
  subscribeToAuthSession,
} from './auth-session';

interface AuthContextValue {
  accessToken: string | null;
  user: LoginResponse['user'] | null;
  isInitializing: boolean;
  authError: string | null;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const session = useSyncExternalStore(
    subscribeToAuthSession,
    getAuthSession,
    () => null,
  );
  const [isInitializing, setIsInitializing] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const restoreSession = useCallback(async () => {
    setIsInitializing(true);
    setAuthError(null);
    try {
      await refreshAuthSession();
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : 'Unable to restore your session.',
      );
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // If we already have a valid access token in localStorage (from a
    // previous login), use it directly — no need to hit the refresh API.
    const existingSession = getAuthSession();
    if (existingSession && isAccessTokenValid(existingSession.accessToken)) {
      setIsInitializing(false);
      return;
    }

    // No valid token — fall back to refresh using the httpOnly cookie.
    refreshAuthSession()
      .catch((error: unknown) => {
        if (isMounted) {
          setAuthError(
            error instanceof Error
              ? error.message
              : 'Unable to restore your session.',
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsInitializing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
      const nextSession = await requestLogin(input);
      queryClient.clear();
      setAuthSession(nextSession);
      setAuthError(null);
    },
    [queryClient],
  );

  const logout = useCallback(() => {
    return requestLogout()
      .catch((error: unknown) => {
        setAuthError(
          error instanceof Error ? error.message : 'Unable to log out.',
        );
      })
      .finally(() => {
        queryClient.clear();
        setAuthSession(null);
      });
  }, [queryClient]);

  const value = useMemo(
    () => ({
      accessToken: session?.accessToken ?? null,
      user: session?.user ?? null,
      isInitializing,
      authError,
      login,
      logout,
      restoreSession,
    }),
    [session, isInitializing, authError, login, logout, restoreSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}
