'use client';

import type { ReactNode } from 'react';
import { useAdminAuthStub } from '../lib/admin-auth-stub';

/**
 * Simple admin role gate shell.
 * Shows "Admin role required" when not signed in as admin mock.
 * Dev toggle labeled staging-only for walkthrough.
 */
export function AdminRoleGate({ children }: { children: ReactNode }) {
  const { ready, isAdmin, session, stubSignInAsAdmin, stubSignOut } = useAdminAuthStub();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-studio-bg px-4">
        <p className="text-sm text-studio-muted">Loading admin gate stub…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-studio-bg px-4">
        <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-studio-panel p-6 text-center shadow-xl sm:p-8">
          <p className="mb-1 text-xs uppercase tracking-widest text-amber-400/90">
            Staging stub — wire when keys land
          </p>
          <h1 className="mb-2 text-2xl font-bold text-white">Admin role required</h1>
          <p className="mb-6 text-sm text-studio-muted">
            Live Supabase role checks are not wired yet. Use the staging-only mock toggle below for
            walkthroughs. No production auth.
          </p>
          <button
            type="button"
            onClick={() => stubSignInAsAdmin()}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-studio-accent px-4 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Sign in as admin (mock · staging-only)
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-amber-900/40 bg-amber-950/40 px-4 py-1.5 text-center text-[11px] text-amber-200/90 sm:text-xs">
        Staging stub admin session · {session?.email} ·{' '}
        <button type="button" onClick={() => stubSignOut()} className="underline hover:text-white">
          Sign out mock
        </button>
        {' · '}wire live role gate when CA keys land
      </div>
      {children}
    </>
  );
}
