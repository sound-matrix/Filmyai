'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { StubBanner, StubToast } from '../../components/StubBanner';
import { useAuthStub } from '../../lib/auth-stub';
import { getSupabaseBrowserClient } from '../../lib/supabase';

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function SignInPage() {
  const router = useRouter();
  const { session, stubSignIn } = useAuthStub();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setToast('');

    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters (client-side only).');
      return;
    }

    setBusy(true);
    const trimmed = email.trim().toLowerCase();
    const client = getSupabaseBrowserClient();

    if (client) {
      try {
        const { data, error: authErr } = await client.auth.signInWithPassword({
          email: trimmed,
          password,
        });

        if (!authErr && data.user) {
          const display =
            (data.user.user_metadata?.display_name as string | undefined) ||
            trimmed.split('@')[0] ||
            'Viewer';
          stubSignIn(data.user.email ?? trimmed, display, data.user.id);
          setToast('Signed in via Supabase — local session set from real user id.');
          setBusy(false);
          setTimeout(() => router.push('/'), 400);
          return;
        }

        setToast(
          'Supabase sign-in failed — falling back to local stub session (staging walkthrough).',
        );
      } catch {
        setToast('Supabase sign-in error — falling back to local stub session.');
      }
    } else {
      setToast('Staging stub — wire when keys land. Local mock session created for walkthrough.');
    }

    stubSignIn(trimmed);
    setBusy(false);
    setTimeout(() => router.push('/'), 400);
  }

  return (
    <div className="mx-auto max-w-md">
      <StubBanner message="Tries live Supabase email/password when anon keys are present; falls back to local stub session. Never prints secrets." />

      <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Sign in</h1>
      <p className="mb-6 text-sm text-filmy-muted">
        Prefer live Supabase when configured · stub fallback for walkthrough
      </p>

      {session && (
        <p className="mb-4 rounded-md border border-filmy-border bg-filmy-elevated px-3 py-2 text-sm text-filmy-muted">
          Already signed in as <span className="text-filmy-fg">{session.email}</span> (stub).
        </p>
      )}

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-xl border border-filmy-border bg-filmy-elevated p-5 sm:p-6"
      >
        <label className="block">
          <span className="mb-1.5 block text-sm text-filmy-muted">Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-11 w-full rounded-md border border-filmy-border bg-filmy-bg px-3 text-filmy-fg outline-none focus:border-filmy-accent"
            placeholder="you@example.com"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-filmy-muted">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-11 w-full rounded-md border border-filmy-border bg-filmy-bg px-3 text-filmy-fg outline-none focus:border-filmy-accent"
            placeholder="••••••••"
            required
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-amber-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-filmy-accent px-4 text-sm font-semibold text-filmy-on-accent transition hover:bg-filmy-accent-hover active:bg-filmy-accent-pressed disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-filmy-muted">
        No account?{' '}
        <Link href="/sign-up" className="text-filmy-accent hover:underline">
          Sign up
        </Link>
      </p>

      <StubToast message={toast} onDismiss={() => setToast('')} />
    </div>
  );
}
