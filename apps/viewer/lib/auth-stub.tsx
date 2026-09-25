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
import type {
  AccessRule,
  AuthSession,
  Entitlement,
  EntitlementGateState,
} from '@filmyai/shared';
import { PLACEHOLDER_SLUG, normalizeAccessRule, resolveAccessGate } from '@filmyai/shared';

const STORAGE_KEY = 'filmyai.viewer.auth.stub.v1';
const DEMO_RULE_KEY = 'filmyai.viewer.demo.access_rule.v1';

type StubSessionPayload = {
  session: AuthSession | null;
  entitlements: Entitlement[];
};

type AuthStubContextValue = {
  ready: boolean;
  session: AuthSession | null;
  entitlements: Entitlement[];
  /** Staging demo access rule for placeholder watch (content lock). */
  demoAccessRule: AccessRule;
  setDemoAccessRule: (rule: AccessRule) => void;
  /** Staging stub sign-in — no live Supabase. */
  stubSignIn: (email: string, displayName?: string) => void;
  stubSignUp: (email: string, displayName: string) => void;
  stubSignOut: () => void;
  /** Mock member subscription entitlement (catalog-wide). */
  stubGrantMember: () => void;
  /** Mock special_pay / admin_grant for a film slug. */
  stubGrantSpecialPay: (slug?: string) => void;
  /** @deprecated Prefer stubGrantMember / stubGrantSpecialPay. */
  stubGrantPlaceholder: () => void;
  stubClearEntitlements: () => void;
  gateForSlug: (slug: string, accessRule?: AccessRule | string) => EntitlementGateState;
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
    const entitlements = Array.isArray(parsed.entitlements)
      ? parsed.entitlements.map((e) => ({
          ...e,
          // Backfill kind for older stub payloads
          kind: e.kind ?? (e.film_slug || e.film_id ? 'admin_grant' : 'member'),
        }))
      : [];
    return {
      session: parsed.session ?? null,
      entitlements,
    };
  } catch {
    return { session: null, entitlements: [] };
  }
}

function loadDemoRule(): AccessRule {
  if (typeof window === 'undefined') return 'members';
  try {
    return normalizeAccessRule(window.localStorage.getItem(DEMO_RULE_KEY) || 'members');
  } catch {
    return 'members';
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
  const [demoAccessRule, setDemoAccessRuleState] = useState<AccessRule>('members');

  useEffect(() => {
    const loaded = load();
    setSession(loaded.session);
    setEntitlements(loaded.entitlements);
    setDemoAccessRuleState(loadDemoRule());
    setReady(true);
  }, []);

  const write = useCallback((nextSession: AuthSession | null, nextEntitlements: Entitlement[]) => {
    setSession(nextSession);
    setEntitlements(nextEntitlements);
    persist({ session: nextSession, entitlements: nextEntitlements });
  }, []);

  const setDemoAccessRule = useCallback((rule: AccessRule) => {
    const normalized = normalizeAccessRule(rule);
    setDemoAccessRuleState(normalized);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DEMO_RULE_KEY, normalized);
    }
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

  const stubGrantMember = useCallback(() => {
    if (!session) return;
    const already = entitlements.some(
      (e) => e.kind === 'member' && e.user_id === session.user_id,
    );
    if (already) return;
    const grant: Entitlement = {
      id: uid('ent'),
      user_id: session.user_id,
      kind: 'member',
      film_id: null,
      film_slug: null,
      reason: 'Staging walkthrough mock member entitlement',
      granted_by: 'mock',
      created_at: new Date().toISOString(),
      expires_at: null,
    };
    write(session, [...entitlements, grant]);
  }, [entitlements, session, write]);

  const stubGrantSpecialPay = useCallback(
    (slug: string = PLACEHOLDER_SLUG) => {
      if (!session) return;
      const already = entitlements.some(
        (e) =>
          e.user_id === session.user_id &&
          (e.kind === 'special_pay' || e.kind === 'admin_grant') &&
          e.film_slug === slug,
      );
      if (already) return;
      const grant: Entitlement = {
        id: uid('ent'),
        user_id: session.user_id,
        kind: 'special_pay',
        film_id: null,
        film_slug: slug,
        reason: 'Staging walkthrough mock special_pay',
        granted_by: 'mock',
        created_at: new Date().toISOString(),
        expires_at: null,
      };
      write(session, [...entitlements, grant]);
    },
    [entitlements, session, write],
  );

  const stubGrantPlaceholder = useCallback(() => {
    stubGrantSpecialPay(PLACEHOLDER_SLUG);
  }, [stubGrantSpecialPay]);

  const stubClearEntitlements = useCallback(() => {
    if (!session) return;
    write(session, []);
  }, [session, write]);

  const gateForSlug = useCallback(
    (slug: string, accessRule?: AccessRule | string): EntitlementGateState => {
      const rule = normalizeAccessRule(accessRule ?? demoAccessRule);
      return resolveAccessGate({
        accessRule: rule,
        session,
        entitlements,
        filmSlug: slug,
      });
    },
    [demoAccessRule, entitlements, session],
  );

  const value = useMemo<AuthStubContextValue>(
    () => ({
      ready,
      session,
      entitlements,
      demoAccessRule,
      setDemoAccessRule,
      stubSignIn,
      stubSignUp,
      stubSignOut,
      stubGrantMember,
      stubGrantSpecialPay,
      stubGrantPlaceholder,
      stubClearEntitlements,
      gateForSlug,
    }),
    [
      ready,
      session,
      entitlements,
      demoAccessRule,
      setDemoAccessRule,
      stubSignIn,
      stubSignUp,
      stubSignOut,
      stubGrantMember,
      stubGrantSpecialPay,
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
