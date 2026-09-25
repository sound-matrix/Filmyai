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

export default function SignUpPage() {
  const router = useRouter();
  const { stubSignUp } = useAuthStub();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) {
      setError('Display name is required.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters (client-side only).');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    const client = getSupabaseBrowserClient();
    if (client) {
      setToast('Supabase client present — live signup not wired yet. Using local stub session.');
    } else {
      setToast('Staging stub — wire when keys land. Local mock session created for walkthrough.');
    }

    stubSignUp(email, displayName);
    setTimeout(() => router.push('/'), 400);
  }

  return (
    <div className="mx-auto max-w-md">
      <StubBanner message="Signup validates locally only. No live Supabase auth until CA Staging keys land." />

      <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Sign up</h1>
      <p className="mb-6 text-sm text-filmy-muted">
        Creates a labeled local mock session for staging walkthrough only
      </p>

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-zinc-800 bg-filmy-card p-5 sm:p-6">
        <label className="block">
          <span className="mb-1.5 block text-sm text-filmy-muted">Display name</span>
          <input
            type="text"
            autoComplete="nickname"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="min-h-11 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-white outline-none focus:border-filmy-accent"
            placeholder="Your name"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-filmy-muted">Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-11 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-white outline-none focus:border-filmy-accent"
            placeholder="you@example.com"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-filmy-muted">Password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-11 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-white outline-none focus:border-filmy-accent"
            placeholder="••••••••"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-filmy-muted">Confirm password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="min-h-11 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-white outline-none focus:border-filmy-accent"
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
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-filmy-accent px-4 text-sm font-semibold text-zinc-950 transition hover:brightness-110"
        >
          Create account (stub)
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-filmy-muted">
        Already have an account?{' '}
        <Link href="/sign-in" className="text-filmy-accent hover:underline">
          Sign in
        </Link>
      </p>

      <StubToast message={toast} onDismiss={() => setToast('')} />
    </div>
  );
}
