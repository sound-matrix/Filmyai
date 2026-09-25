'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { useAdminAuth } from '../../lib/admin-auth';

export default function SignInPage() {
  const router = useRouter();
  const { ready, configured, isAdmin, deniedRole, missingProfile, session, signIn, signOut } =
    useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && isAdmin) {
      router.replace('/');
    }
  }, [ready, isAdmin, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await signIn(email, password);
      if (!result.ok) {
        setError(result.error);
      }
      // Success: onAuthStateChange updates context; effect redirects if admin.
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-studio-bg px-4">
        <p className="text-sm text-studio-muted">Loading…</p>
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
            Vercel project. Same env contract as viewer — do not invent keys.
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
              ? 'Signed in, but no profiles row exists yet. CA must seed public.profiles.role = admin after creating the Auth user.'
              : 'You are signed in, but this account is not an admin. CMS access is denied.'}
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
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-studio-bg px-4">
        <p className="text-sm text-studio-muted">Redirecting to studio…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-studio-bg px-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-studio-panel p-6 shadow-xl sm:p-8">
        <p className="mb-1 text-center text-xs uppercase tracking-widest text-amber-400/90">
          Staging · FilmyAI Admin
        </p>
        <h1 className="mb-2 text-center text-2xl font-bold text-white">Sign in</h1>
        <p className="mb-6 text-center text-sm text-studio-muted">
          Email and password via Supabase Auth. Admin CMS requires{' '}
          <code className="text-xs text-studio-accent">profiles.role = admin</code>.
        </p>
        <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-4">
          <label className="block text-left text-sm">
            <span className="mb-1.5 block text-studio-muted">Email</span>
            <input
              type="email"
              name="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-11 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-white outline-none focus:border-studio-accent"
            />
          </label>
          <label className="block text-left text-sm">
            <span className="mb-1.5 block text-studio-muted">Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-h-11 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-white outline-none focus:border-studio-accent"
            />
          </label>
          {error ? (
            <p className="rounded-md border border-amber-900/50 bg-amber-950/40 px-3 py-2 text-sm text-amber-100" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-studio-accent px-4 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-studio-muted">
          <Link href="/" className="underline hover:text-white">
            Studio home
          </Link>
          {' · '}password never stored in repo or tickets
        </p>
      </div>
    </div>
  );
}
