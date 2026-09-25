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
import type { AuthSession, Entitlement, EntitlementGateState } from '@filmyai/shared';
import { PLACEHOLDER_SLUG } from '@filmyai/shared';

const STORAGE_KEY = 'filmyai.viewer.auth.stub.v1';

type StubSessionPayload = {
  session: AuthSession | null;
  entitlements: Entitlement[];
};

type AuthStubContextValue = {
  ready: boolean;
  session: AuthSession | null;
  entitlements: Entitlement[];
  /** Staging stub sign-in — no live Supabase. */
  stubSignIn: (email: string, displayName?: string) => void;
  stubSignUp: (email: string, displayName: string) => void;
  stubSignOut: () => void;
  /** Grant mock entitlement for placeholder walkthrough. */
  stubGrantPlaceholder: () => void;
  stubClearEntitlements: () => void;
  gateForSlug: (slug: string) => EntitlementGateState;
};

const AuthStubContext = createContext<AuthStubContextValue | null>(null);

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function load(): StubSessionPayload {
  if (typeof window === 'undefined') return { session: null, entitlements: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { session: null, entitlements: [] };
    const parsed = JSON.parse(raw) as StubSessionPayload;
    return {
      session: parsed.session ?? null,
      entitlements: Array.isArray(parsed.entitlements) ? parsed.entitlements : [],
    };
  } catch {
    return { session: null, entitlements: [] };
  }
}

function persist(payload: StubSessionPayload) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function AuthStubProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);

  useEffect(() => {
    const loaded = load();
    setSession(loaded.session);
    setEntitlements(loaded.entitlements);
    setReady(true);
  }, []);

  const write = useCallback((nextSession: AuthSession | null, nextEntitlements: Entitlement[]) => {
    setSession(nextSession);
    setEntitlements(nextEntitlements);
    persist({ session: nextSession, entitlements: nextEntitlements });
  }, []);

  const stubSignIn = useCallback(
    (email: string, displayName?: string) => {
      const trimmed = email.trim().toLowerCase();
      const sessionNext: AuthSession = {
        user_id: uid('user'),
        email: trimmed,
        role: 'viewer',
        display_name: displayName?.trim() || trimmed.split('@')[0] || 'Viewer',
      };
      write(sessionNext, entitlements);
    },
    [entitlements, write],
  );

  const stubSignUp = useCallback(
    (email: string, displayName: string) => {
      stubSignIn(email, displayName);
    },
    [stubSignIn],
  );

  const stubSignOut = useCallback(() => {
    write(null, []);
  }, [write]);

  const stubGrantPlaceholder = useCallback(() => {
    if (!session) return;
    const already = entitlements.some(
      (e) => e.film_slug === PLACEHOLDER_SLUG && e.user_id === session.user_id,
    );
    if (already) return;
    const grant: Entitlement = {
      id: uid('ent'),
      user_id: session.user_id,
      film_id: null,
      film_slug: PLACEHOLDER_SLUG,
      reason: 'Staging walkthrough mock grant',
      granted_by: 'mock',
      created_at: new Date().toISOString(),
      expires_at: null,
    };
    write(session, [...entitlements, grant]);
  }, [entitlements, session, write]);

  const stubClearEntitlements = useCallback(() => {
    if (!session) return;
    write(session, []);
  }, [session, write]);

  const gateForSlug = useCallback(
    (slug: string): EntitlementGateState => {
      if (!session) return 'signed_out';
      const entitled = entitlements.some((e) => e.film_slug === slug || e.film_id === slug);
      return entitled ? 'entitled' : 'signed_in_no_entitlement';
    },
    [entitlements, session],
  );

  const value = useMemo<AuthStubContextValue>(
    () => ({
      ready,
      session,
      entitlements,
      stubSignIn,
      stubSignUp,
      stubSignOut,
      stubGrantPlaceholder,
      stubClearEntitlements,
      gateForSlug,
    }),
    [
      ready,
      session,
      entitlements,
      stubSignIn,
      stubSignUp,
      stubSignOut,
      stubGrantPlaceholder,
      stubClearEntitlements,
      gateForSlug,
    ],
  );

  return <AuthStubContext.Provider value={value}>{children}</AuthStubContext.Provider>;
}

export function useAuthStub() {
  const ctx = useContext(AuthStubContext);
  if (!ctx) throw new Error('useAuthStub must be used within AuthStubProvider');
  return ctx;
}
