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

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters (client-side only).');
      return;
    }

    const client = getSupabaseBrowserClient();
    if (client) {
      setToast('Supabase client present — live auth not wired yet. Using local stub session.');
    } else {
      setToast('Staging stub — wire when keys land. Local mock session created for walkthrough.');
    }

    stubSignIn(email);
    setTimeout(() => router.push('/'), 400);
  }

  return (
    <div className="mx-auto max-w-md">
      <StubBanner message="Email/password form validates locally only. No live Supabase sign-in until CA Staging keys land." />

      <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Sign in</h1>
      <p className="mb-6 text-sm text-filmy-muted">
        Optional local session mock for walkthrough · clearly labeled staging-only
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
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-filmy-accent px-4 text-sm font-semibold text-filmy-on-accent transition hover:bg-filmy-accent-hover active:bg-filmy-accent-pressed"
        >
          Sign in (stub)
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
