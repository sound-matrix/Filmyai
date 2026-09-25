'use client';

import Link from 'next/link';
import { useAuthStub } from '../lib/auth-stub';

export function ViewerHeader() {
  const { ready, session, stubSignOut } = useAuthStub();

  return (
    <header className="sticky top-0 z-40 border-b border-filmy-border bg-filmy-bg/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg sm:text-xl">
            <span className="text-filmy-fg tracking-[0.14em] font-semibold">FILMY</span>
            <span className="text-filmy-accent tracking-[0.14em] font-semibold">AI</span>
          </Link>
          <span className="hidden text-[10px] uppercase tracking-widest text-filmy-muted sm:inline sm:text-xs">
            Viewer · Staging
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {!ready ? (
            <span className="text-xs text-filmy-muted">…</span>
          ) : session ? (
            <>
              <span className="hidden max-w-[10rem] truncate text-xs text-filmy-muted sm:inline">
                {session.display_name}
                <span className="ml-1 rounded bg-filmy-elevated px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-amber-400">
                  stub
                </span>
              </span>
              <button
                type="button"
                onClick={() => stubSignOut()}
                className="inline-flex min-h-11 items-center rounded-md border border-filmy-ghost bg-transparent px-3 py-2 text-sm font-medium text-filmy-fg transition hover:border-filmy-muted"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="inline-flex min-h-11 items-center rounded-md border border-filmy-ghost bg-transparent px-3 py-2 text-sm font-medium text-filmy-fg transition hover:border-filmy-muted"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex min-h-11 items-center rounded-md bg-filmy-accent px-3 py-2 text-sm font-semibold text-filmy-on-accent transition hover:bg-filmy-accent-hover active:bg-filmy-accent-pressed"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
      <div className="border-t border-amber-900/40 bg-amber-950/40 px-4 py-1.5 text-center text-[11px] text-amber-200/90 sm:text-xs">
        Staging stub — wire when keys land · no live Supabase auth
      </div>
    </header>
  );
}
