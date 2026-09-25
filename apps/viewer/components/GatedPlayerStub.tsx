'use client';

import Link from 'next/link';
import { PLACEHOLDER_SLUG } from '@filmyai/shared';
import { useAuthStub } from '../lib/auth-stub';

/** Membership/sign-in gate + empty black player frame — no media sources / no Stripe. */
export function GatedPlayerStub() {
  const {
    ready,
    session,
    gateForSlug,
    stubGrantPlaceholder,
    stubClearEntitlements,
  } = useAuthStub();

  const gate = ready ? gateForSlug(PLACEHOLDER_SLUG) : 'signed_out';

  return (
    <div>
      <div className="relative mb-4 overflow-hidden rounded-xl border border-zinc-700 bg-black">
        <div className="flex aspect-video items-center justify-center">
          <div className="pointer-events-none absolute inset-0 bg-zinc-950" aria-hidden />
          <div className="relative z-10 mx-4 max-w-md rounded-lg border border-zinc-600 bg-filmy-card/95 p-5 text-center shadow-xl sm:p-6">
            {!ready ? (
              <p className="text-sm text-filmy-muted">Loading gate stub…</p>
            ) : gate === 'signed_out' ? (
              <>
                <p className="mb-1 text-xs uppercase tracking-widest text-filmy-muted">
                  Access gate · signed out
                </p>
                <h2 className="mb-2 text-lg font-semibold text-white sm:text-xl">
                  Sign in required
                </h2>
                <p className="mb-4 text-sm text-filmy-muted">
                  Staging stub UI shell. No media loaded · no live Stripe. Sign in to continue the
                  entitlement walkthrough.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <Link
                    href="/sign-in"
                    className="inline-flex min-h-11 items-center justify-center rounded-md bg-filmy-accent px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:brightness-110"
                  >
                    Sign in
                  </Link>
                  <Link
                    href={`/films/${PLACEHOLDER_SLUG}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-600 px-5 py-2.5 text-sm font-medium text-white transition hover:border-zinc-400"
                  >
                    Back to detail
                  </Link>
                </div>
              </>
            ) : gate === 'signed_in_no_entitlement' ? (
              <>
                <p className="mb-1 text-xs uppercase tracking-widest text-amber-400/90">
                  Access gate · no entitlement
                </p>
                <h2 className="mb-2 text-lg font-semibold text-white sm:text-xl">
                  Entitlement required
                </h2>
                <p className="mb-2 text-sm text-filmy-muted">
                  Signed in as <span className="text-white">{session?.email}</span> (stub) but no
                  catalog grant for this title.
                </p>
                <p className="mb-4 text-xs text-filmy-muted">
                  No real Stripe checkout — use the staging mock grant for walkthrough only.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    onClick={() => stubGrantPlaceholder()}
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-amber-600 bg-amber-950/60 px-5 py-2.5 text-sm font-semibold text-amber-100 transition hover:border-amber-400"
                  >
                    Mock grant (staging)
                  </button>
                  <Link
                    href={`/films/${PLACEHOLDER_SLUG}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-600 px-5 py-2.5 text-sm font-medium text-white transition hover:border-zinc-400"
                  >
                    Back to detail
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="mb-1 text-xs uppercase tracking-widest text-emerald-400/90">
                  Access gate · entitled
                </p>
                <h2 className="mb-2 text-lg font-semibold text-white sm:text-xl">
                  Entitled (stub shell)
                </h2>
                <p className="mb-4 text-sm text-filmy-muted">
                  Mock entitlement present. Player frame stays empty — Anthony content lock (no
                  Drive media). Wire live playback after catalog + keys.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <span className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-md bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-filmy-muted">
                    Play (no media)
                  </span>
                  <button
                    type="button"
                    onClick={() => stubClearEntitlements()}
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-600 px-5 py-2.5 text-sm font-medium text-white transition hover:border-zinc-400"
                  >
                    Clear mock grant
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <h1 className="mb-2 text-xl font-bold sm:text-2xl">Title placeholder</h1>
      <p className="mb-3 text-sm text-filmy-muted">
        Awaiting FilmyAI upload · gated player stub · SOU-8 entitlement shells
      </p>
      <Link href={`/films/${PLACEHOLDER_SLUG}`} className="text-sm text-filmy-accent hover:underline">
        ← Back to detail
      </Link>
    </div>
  );
}
