'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import type { AccessRule } from '@filmyai/shared';
import {
  PLACEHOLDER_SLUG,
  centsToRupeesDisplay,
  normalizeAccessRule,
} from '@filmyai/shared';
import { useAuthStub } from '../lib/auth-stub';
import { openRazorpayCheckout, type RazorpayCheckoutSuccess } from '../lib/load-razorpay';

/** Staging walkthrough defaults (admin editable member price lives in pricing_settings). */
const DEFAULT_MEMBER_CENTS = 49900;
const DEFAULT_SPECIAL_CENTS = 9900;

type CheckoutKind = 'member' | 'special_pay';

/** Membership/sign-in gate + empty black player frame — Razorpay test-mode checkout (SOU-15). */
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

  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [keysMissingHint, setKeysMissingHint] = useState(false);

  const accessRule = normalizeAccessRule(demoAccessRule);
  const gate = ready ? gateForSlug(PLACEHOLDER_SLUG, accessRule) : 'need_sign_in';

  const modes: { id: AccessRule; label: string }[] = [
    { id: 'free', label: 'Free' },
    { id: 'members', label: 'Members' },
    { id: 'special_pay', label: 'Special pay' },
  ];

  const startCheckout = useCallback(
    async (kind: CheckoutKind) => {
      if (!session || checkoutBusy) return;
      setCheckoutBusy(true);
      setCheckoutError('');
      setKeysMissingHint(false);

      try {
        const createRes = await fetch('/api/checkout/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kind,
            film_slug: kind === 'special_pay' ? PLACEHOLDER_SLUG : undefined,
            stub_email: session.email,
            stub_user_id: session.user_id,
          }),
        });

        const createJson = (await createRes.json().catch(() => ({}))) as {
          ok?: boolean;
          error?: string;
          key_id?: string;
          order_id?: string;
          amount?: number;
          currency?: string;
          kind?: CheckoutKind;
          film_slug?: string | null;
        };

        if (createRes.status === 503) {
          setKeysMissingHint(true);
          setCheckoutError(
            createJson.error || 'Razorpay test keys not on this deploy yet',
          );
          setCheckoutBusy(false);
          return;
        }

        if (!createRes.ok || !createJson.ok || !createJson.key_id || !createJson.order_id) {
          setCheckoutError(createJson.error || 'Could not create Razorpay order.');
          setCheckoutBusy(false);
          return;
        }

        await openRazorpayCheckout({
          key: createJson.key_id,
          order_id: createJson.order_id,
          amount: createJson.amount ?? (kind === 'member' ? DEFAULT_MEMBER_CENTS : DEFAULT_SPECIAL_CENTS),
          currency: createJson.currency ?? 'INR',
          name: 'FilmyAI Staging',
          description:
            kind === 'member'
              ? 'Member subscription (Razorpay test mode)'
              : 'Special pay (Razorpay test mode)',
          prefill: { email: session.email, name: session.display_name },
          notes: {
            kind,
            film_slug: kind === 'special_pay' ? PLACEHOLDER_SLUG : '',
          },
          handler: async (response: RazorpayCheckoutSuccess) => {
            try {
              const verifyRes = await fetch('/api/checkout/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  stub_email: session.email,
                }),
              });
              const verifyJson = (await verifyRes.json().catch(() => ({}))) as {
                ok?: boolean;
                error?: string;
                granted?: boolean;
                grant_mode?: string;
              };

              if (!verifyRes.ok || !verifyJson.ok) {
                setCheckoutError(verifyJson.error || 'Payment verification failed.');
                return;
              }

              // Unlock UI immediately via local stub entitlements
              if (kind === 'member') {
                stubGrantMember();
              } else {
                stubGrantSpecialPay(PLACEHOLDER_SLUG);
              }
              setCheckoutError('');
            } catch {
              setCheckoutError('Payment verify request failed.');
            } finally {
              setCheckoutBusy(false);
            }
          },
          ondismiss: () => {
            setCheckoutBusy(false);
          },
        });
      } catch (err) {
        setCheckoutError(err instanceof Error ? err.message : 'Checkout failed.');
        setCheckoutBusy(false);
        return;
      }

      // Keep busy until handler/ondismiss; if openRazorpayCheckout threw we already cleared
    },
    [checkoutBusy, session, stubGrantMember, stubGrantSpecialPay],
  );

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
          Free = entitled without sign-in · Members / Special pay use entitlements · Razorpay{' '}
          <span className="text-filmy-fg">test mode</span> checkout (SOU-15). Mock grants remain as
          walkthrough fallback.
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
                  Staging gate UI. No media loaded · Razorpay test-mode checkout available after
                  sign-in. Sign in to continue.
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
                  Razorpay <span className="text-filmy-fg">test mode</span> — no live charges. Mock
                  grant remains as walkthrough fallback.
                </p>
                {checkoutError ? (
                  <p role="alert" className="mb-3 text-sm text-amber-400">
                    {keysMissingHint
                      ? 'Razorpay test keys not on this deploy yet — use mock grant, or ask DevOps to bake NEXT_PUBLIC_RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET into filmyai-staging Production and redeploy.'
                      : checkoutError}
                  </p>
                ) : null}
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    disabled={checkoutBusy || !session}
                    onClick={() => startCheckout('member')}
                    className="inline-flex min-h-11 items-center justify-center rounded-md bg-filmy-accent px-5 py-2.5 text-sm font-semibold text-filmy-on-accent transition hover:bg-filmy-accent-hover active:bg-filmy-accent-pressed disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {checkoutBusy ? 'Opening checkout…' : 'Pay with Razorpay (test)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => stubGrantMember()}
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-amber-600 bg-amber-950/60 px-5 py-2.5 text-sm font-semibold text-amber-100 transition hover:border-amber-400"
                  >
                    Mock grant member (walkthrough fallback)
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
                  Razorpay <span className="text-filmy-fg">test mode</span> — no live charges. Mock
                  grant remains as walkthrough fallback.
                </p>
                {checkoutError ? (
                  <p role="alert" className="mb-3 text-sm text-amber-400">
                    {keysMissingHint
                      ? 'Razorpay test keys not on this deploy yet — use mock grant, or ask DevOps to bake NEXT_PUBLIC_RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET into filmyai-staging Production and redeploy.'
                      : checkoutError}
                  </p>
                ) : null}
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    disabled={checkoutBusy || !session}
                    onClick={() => startCheckout('special_pay')}
                    className="inline-flex min-h-11 items-center justify-center rounded-md bg-filmy-accent px-5 py-2.5 text-sm font-semibold text-filmy-on-accent transition hover:bg-filmy-accent-hover active:bg-filmy-accent-pressed disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {checkoutBusy ? 'Opening checkout…' : 'Pay with Razorpay (test)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => stubGrantSpecialPay(PLACEHOLDER_SLUG)}
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-amber-600 bg-amber-950/60 px-5 py-2.5 text-sm font-semibold text-amber-100 transition hover:border-amber-400"
                  >
                    Mock grant special pay (walkthrough fallback)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <h1 className="mb-2 font-display text-xl font-bold sm:text-2xl">Title placeholder</h1>
      <p className="mb-3 text-sm text-filmy-muted">
        Awaiting FilmyAI upload · gated player stub · SOU-15 Razorpay test-mode checkout
      </p>
      <Link href={`/films/${PLACEHOLDER_SLUG}`} className="text-sm text-filmy-accent hover:underline">
        ← Back to detail
      </Link>
    </div>
  );
}
