'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAdminAuth } from '../lib/admin-auth';

/**
 * Live admin role gate.
 * Signed-out → /sign-in. Authenticated non-admin → denial (no CMS).
 * Soft-fails when Supabase public env vars are missing.
 */
export function AdminRoleGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const {
    ready,
    configured,
    isAdmin,
    deniedRole,
    missingProfile,
    session,
    signOut,
  } = useAdminAuth();

  useEffect(() => {
    if (!ready || !configured) return;
    if (!isAdmin && !deniedRole) {
      router.replace('/sign-in');
    }
  }, [ready, configured, isAdmin, deniedRole, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-studio-bg px-4">
        <p className="text-sm text-studio-muted">Checking admin session…</p>
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-studio-bg px-4">
        <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-studio-panel p-6 text-center shadow-xl sm:p-8">
          <p className="mb-1 text-xs uppercase tracking-widest text-amber-400/90">
            Staging · env missing
          </p>
          <h1 className="mb-2 text-2xl font-bold text-white">Supabase not configured</h1>
          <p className="text-sm text-studio-muted">
            Set <code className="text-studio-accent">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="text-studio-accent">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> on the admin
            Vercel project (same names as viewer). Do not invent keys — wait for CA staging values.
          </p>
        </div>
      </div>
    );
  }

  if (deniedRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-studio-bg px-4">
        <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-studio-panel p-6 text-center shadow-xl sm:p-8">
          <p className="mb-1 text-xs uppercase tracking-widest text-amber-400/90">Staging</p>
          <h1 className="mb-2 text-2xl font-bold text-white">Admin role required</h1>
          <p className="mb-6 text-sm text-studio-muted">
            {missingProfile
              ? 'Signed in, but no profiles row was found for this account. Ask CA to seed public.profiles with role = admin after the Auth user exists.'
              : 'This account is signed in but does not have profiles.role = admin. CMS access is denied.'}
          </p>
          {session?.email ? (
            <p className="mb-4 text-xs text-studio-muted">{session.email}</p>
          ) : null}
          <button
            type="button"
            onClick={() => void signOut()}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Sign out
          </button>
          <p className="mt-4 text-xs text-studio-muted">
            <Link href="/sign-in" className="underline hover:text-white">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-studio-bg px-4">
        <p className="text-sm text-studio-muted">Redirecting to sign in…</p>
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-zinc-800 bg-studio-panel/80 px-4 py-1.5 text-center text-[11px] text-studio-muted sm:text-xs">
        Staging admin · {session?.email} ·{' '}
        <button
          type="button"
          onClick={() => void signOut()}
          className="underline hover:text-white"
        >
          Sign out
        </button>
      </div>
      {children}
    </>
  );
}
