'use client';

import Link from 'next/link';
import type { AccessRule } from '@filmyai/shared';
import {
  PLACEHOLDER_SLUG,
  centsToRupeesDisplay,
  normalizeAccessRule,
} from '@filmyai/shared';
import { useAuthStub } from '../lib/auth-stub';

/** Staging walkthrough defaults (admin editable member price lives in pricing_settings). */
const DEFAULT_MEMBER_CENTS = 49900;
const DEFAULT_SPECIAL_CENTS = 9900;

/** Membership/sign-in gate + empty black player frame — no media / no Razorpay. */
export function GatedPlayerStub() {
  const {
    ready,
    session,
    demoAccessRule,
    setDemoAccessRule,
    gateForSlug,
    stubGrantMember,
    stubGrantSpecialPay,
    stubClearEntitlements,
  } = useAuthStub();

  const accessRule = normalizeAccessRule(demoAccessRule);
  const gate = ready ? gateForSlug(PLACEHOLDER_SLUG, accessRule) : 'need_sign_in';

  const modes: { id: AccessRule; label: string }[] = [
    { id: 'free', label: 'Free' },
    { id: 'members', label: 'Members' },
    { id: 'special_pay', label: 'Special pay' },
  ];

  return (
    <div>
      <div className="mb-4 rounded-lg border border-filmy-border bg-filmy-elevated/80 p-3 sm:p-4">
        <p className="mb-2 text-xs uppercase tracking-widest text-filmy-muted">
          Staging demo · access mode (content lock — no catalog films)
        </p>
        <div className="flex flex-wrap gap-2">
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setDemoAccessRule(m.id)}
              className={`inline-flex min-h-10 items-center rounded-md px-3 py-1.5 text-sm font-medium transition ${
                accessRule === m.id
                  ? 'bg-filmy-accent text-filmy-on-accent'
                  : 'border border-filmy-ghost text-filmy-fg hover:border-filmy-muted'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-filmy-muted">
          Free = entitled without sign-in · Members / Special pay use stub entitlements · Checkout
          Razorpay comes in SOU-15
        </p>
      </div>

      <div className="relative mb-4 overflow-hidden rounded-xl border border-filmy-border bg-black">
        <div className="flex aspect-video items-center justify-center">
          <div className="pointer-events-none absolute inset-0 bg-filmy-bg" aria-hidden />
          <div className="relative z-10 mx-4 max-w-md rounded-lg border border-filmy-border bg-filmy-elevated/95 p-5 text-center shadow-xl sm:p-6">
            {!ready ? (
              <p className="text-sm text-filmy-muted">Loading gate stub…</p>
            ) : gate === 'entitled' || gate === 'free' ? (
              <>
                <p className="mb-1 text-xs uppercase tracking-widest text-emerald-400/90">
                  Access gate · entitled · {accessRule}
                </p>
                <h2 className="mb-2 text-lg font-semibold text-filmy-fg sm:text-xl">
                  Entitled (stub shell)
                </h2>
                <p className="mb-4 text-sm text-filmy-muted">
                  {accessRule === 'free'
                    ? 'Free mode — no sign-in required. Player frame stays empty (Anthony content lock).'
                    : 'Entitlement present. Player frame stays empty — wire live playback after catalog + keys.'}
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <span className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-md bg-filmy-elevated px-5 py-2.5 text-sm font-semibold text-filmy-muted">
                    Play (no media)
                  </span>
                  {accessRule !== 'free' ? (
                    <button
                      type="button"
                      onClick={() => stubClearEntitlements()}
                      className="inline-flex min-h-11 items-center justify-center rounded-md border border-filmy-ghost bg-transparent px-5 py-2.5 text-sm font-medium text-filmy-fg transition hover:border-filmy-muted"
                    >
                      Clear mock grant
                    </button>
                  ) : null}
                </div>
              </>
            ) : gate === 'need_sign_in' || gate === 'signed_out' ? (
              <>
                <p className="mb-1 text-xs uppercase tracking-widest text-filmy-muted">
                  Access gate · need sign-in · {accessRule}
                </p>
                <h2 className="mb-2 text-lg font-semibold text-filmy-fg sm:text-xl">
                  Sign in required
                </h2>
                <p className="mb-4 text-sm text-filmy-muted">
                  Staging stub UI shell. No media loaded · Razorpay checkout is SOU-15. Sign in to
                  continue the entitlement walkthrough.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <Link
                    href="/sign-in"
                    className="inline-flex min-h-11 items-center justify-center rounded-md bg-filmy-accent px-5 py-2.5 text-sm font-semibold text-filmy-on-accent transition hover:bg-filmy-accent-hover active:bg-filmy-accent-pressed"
                  >
                    Sign in
                  </Link>
                  <Link
                    href={`/films/${PLACEHOLDER_SLUG}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-filmy-ghost bg-transparent px-5 py-2.5 text-sm font-medium text-filmy-fg transition hover:border-filmy-muted"
                  >
                    Back to detail
                  </Link>
                </div>
              </>
            ) : gate === 'need_member' ? (
              <>
                <p className="mb-1 text-xs uppercase tracking-widest text-amber-400/90">
                  Access gate · need member
                </p>
                <h2 className="mb-2 text-lg font-semibold text-filmy-fg sm:text-xl">
                  Become a Member
                </h2>
                <p className="mb-2 text-sm text-filmy-muted">
                  Signed in as <span className="text-filmy-fg">{session?.email}</span> but no active
                  member entitlement.
                </p>
                <p className="mb-1 text-sm text-filmy-fg">
                  ₹{centsToRupeesDisplay(DEFAULT_MEMBER_CENTS)} / membership (staging default)
                </p>
                <p className="mb-4 text-xs text-filmy-muted">
                  Checkout SOU-15 (Razorpay) — not wired here. Use mock grant for walkthrough.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    disabled
                    className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-md bg-filmy-elevated px-5 py-2.5 text-sm font-semibold text-filmy-muted"
                    title="Razorpay checkout arrives in SOU-15"
                  >
                    Checkout SOU-15
                  </button>
                  <button
                    type="button"
                    onClick={() => stubGrantMember()}
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-amber-600 bg-amber-950/60 px-5 py-2.5 text-sm font-semibold text-amber-100 transition hover:border-amber-400"
                  >
                    Mock grant member
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-1 text-xs uppercase tracking-widest text-amber-400/90">
                  Access gate · need special pay
                </p>
                <h2 className="mb-2 text-lg font-semibold text-filmy-fg sm:text-xl">
                  Special pay required
                </h2>
                <p className="mb-2 text-sm text-filmy-muted">
                  Signed in as <span className="text-filmy-fg">{session?.email}</span> — one-time fee
                  for this title.
                </p>
                <p className="mb-1 text-sm text-filmy-fg">
                  ₹{centsToRupeesDisplay(DEFAULT_SPECIAL_CENTS)} one-time (staging demo default)
                </p>
                <p className="mb-4 text-xs text-filmy-muted">
                  Checkout SOU-15 (Razorpay) — not wired here. Mock grant unlocks the stub shell.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    disabled
                    className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-md bg-filmy-elevated px-5 py-2.5 text-sm font-semibold text-filmy-muted"
                    title="Razorpay checkout arrives in SOU-15"
                  >
                    Checkout SOU-15
                  </button>
                  <button
                    type="button"
                    onClick={() => stubGrantSpecialPay(PLACEHOLDER_SLUG)}
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-amber-600 bg-amber-950/60 px-5 py-2.5 text-sm font-semibold text-amber-100 transition hover:border-amber-400"
                  >
                    Mock grant special pay
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <h1 className="mb-2 font-display text-xl font-bold sm:text-2xl">Title placeholder</h1>
      <p className="mb-3 text-sm text-filmy-muted">
        Awaiting FilmyAI upload · gated player stub · SOU-14 Free / Members / Special pay
      </p>
      <Link href={`/films/${PLACEHOLDER_SLUG}`} className="text-sm text-filmy-accent hover:underline">
        ← Back to detail
      </Link>
    </div>
  );
}
