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
import type { AuthSession, Profile } from '@filmyai/shared';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient, isSupabaseConfigured } from './supabase';

type SignInResult = { ok: true } | { ok: false; error: string };

type AdminAuthValue = {
  ready: boolean;
  configured: boolean;
  session: AuthSession | null;
  isAdmin: boolean;
  /** Authenticated but missing profile or role !== admin. */
  deniedRole: boolean;
  /** Missing profile row (vs present but non-admin). */
  missingProfile: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, display_name')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.warn('[filmyai-admin] profiles lookup failed:', error.message);
    return null;
  }
  if (!data) return null;
  return data as Profile;
}

function toAuthSession(
  session: Session,
  profile: Profile | null,
): AuthSession {
  return {
    user_id: session.user.id,
    email: session.user.email ?? '',
    role: profile?.role ?? 'viewer',
    display_name: profile?.display_name ?? '',
    expires_at: session.expires_at
      ? new Date(session.expires_at * 1000).toISOString()
      : null,
  };
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const [ready, setReady] = useState(!configured);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasAuthUser, setHasAuthUser] = useState(false);

  useEffect(() => {
    if (!configured) {
      setReady(true);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setReady(true);
      return;
    }

    let cancelled = false;

    async function applySession(next: Session | null) {
      if (cancelled) return;
      if (!next?.user) {
        setHasAuthUser(false);
        setSession(null);
        setProfile(null);
        setReady(true);
        return;
      }
      setHasAuthUser(true);
      const p = await fetchProfile(next.user.id);
      if (cancelled) return;
      setProfile(p);
      setSession(toAuthSession(next, p));
      setReady(true);
    }

    void supabase.auth.getSession().then(({ data }) => applySession(data.session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      // Do not flip ready=false on token refresh — avoids CMS flicker.
      void applySession(next);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [configured]);

  const signIn = useCallback(async (email: string, password: string): Promise<SignInResult> => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return {
        ok: false,
        error:
          'Supabase is not configured for this staging deploy. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY on the admin Vercel project.',
      };
    }
    const trimmed = email.trim();
    if (!trimmed || !password) {
      return { ok: false, error: 'Email and password are required.' };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: trimmed,
      password,
    });
    if (error) {
      // Never log password. Map common auth failures to a safe message.
      const msg = error.message?.toLowerCase() ?? '';
      if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
        return { ok: false, error: 'Invalid email or password.' };
      }
      return { ok: false, error: 'Sign-in failed. Try again or contact staging ops.' };
    }
    return { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setSession(null);
      setProfile(null);
      setHasAuthUser(false);
      return;
    }
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setHasAuthUser(false);
  }, []);

  const isAdmin = profile?.role === 'admin';
  const missingProfile = hasAuthUser && !profile;
  const deniedRole = hasAuthUser && !isAdmin;

  const value = useMemo<AdminAuthValue>(
    () => ({
      ready,
      configured,
      session,
      isAdmin,
      deniedRole,
      missingProfile,
      signIn,
      signOut,
    }),
    [
      ready,
      configured,
      session,
      isAdmin,
      deniedRole,
      missingProfile,
      signIn,
      signOut,
    ],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
