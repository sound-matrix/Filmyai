'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthSession } from '@filmyai/shared';

const STORAGE_KEY = 'filmyai.admin.auth.stub.v1';

type AdminAuthStubValue = {
  ready: boolean;
  session: AuthSession | null;
  isAdmin: boolean;
  /** Staging-only walkthrough toggle — labeled in UI. */
  stubSignInAsAdmin: () => void;
  stubSignOut: () => void;
};

const AdminAuthStubContext = createContext<AdminAuthStubValue | null>(null);

function loadSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function AdminAuthStubProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    setSession(loadSession());
    setReady(true);
  }, []);

  const stubSignInAsAdmin = useCallback(() => {
    const next: AuthSession = {
      user_id: 'stub_admin_local',
      email: 'admin@staging.filmyai.local',
      role: 'admin',
      display_name: 'Staging Admin',
    };
    setSession(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const stubSignOut = useCallback(() => {
    setSession(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<AdminAuthStubValue>(
    () => ({
      ready,
      session,
      isAdmin: session?.role === 'admin',
      stubSignInAsAdmin,
      stubSignOut,
    }),
    [ready, session, stubSignInAsAdmin, stubSignOut],
  );

  return (
    <AdminAuthStubContext.Provider value={value}>{children}</AdminAuthStubContext.Provider>
  );
}

export function useAdminAuthStub() {
  const ctx = useContext(AdminAuthStubContext);
  if (!ctx) throw new Error('useAdminAuthStub must be used within AdminAuthStubProvider');
  return ctx;
}
