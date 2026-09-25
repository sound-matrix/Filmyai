import type {
  AccessRule,
  AccessRuleAlias,
  AuthSession,
  Entitlement,
  EntitlementGateState,
} from './types';

/** Map legacy aliases to canonical AccessRule. */
export function normalizeAccessRule(rule: AccessRuleAlias | string | null | undefined): AccessRule {
  if (rule === 'public' || rule === 'free') return 'free';
  if (rule === 'paid' || rule === 'special_pay') return 'special_pay';
  if (rule === 'members') return 'members';
  return 'free';
}

function isExpired(expiresAt: string | null | undefined, now: Date): boolean {
  if (!expiresAt) return false;
  const t = Date.parse(expiresAt);
  if (Number.isNaN(t)) return false;
  return t <= now.getTime();
}

function matchesFilm(
  e: Entitlement,
  filmSlug?: string | null,
  filmId?: string | null,
): boolean {
  if (filmId && e.film_id && e.film_id === filmId) return true;
  if (filmSlug && e.film_slug && e.film_slug === filmSlug) return true;
  return false;
}

export type ResolveAccessGateInput = {
  accessRule: AccessRuleAlias | string;
  session: AuthSession | null;
  entitlements: Entitlement[];
  filmSlug?: string | null;
  filmId?: string | null;
  /** Override clock for tests. */
  now?: Date;
};

/**
 * Pure gate resolver for Free / Members / Special pay.
 * - Free → entitled without session
 * - Members → need sign-in, then active kind=member (not expired)
 * - Special pay → need sign-in, then film-specific special_pay or admin_grant
 */
export function resolveAccessGate(input: ResolveAccessGateInput): EntitlementGateState {
  const rule = normalizeAccessRule(input.accessRule);
  const now = input.now ?? new Date();
  const { session, entitlements, filmSlug, filmId } = input;

  if (rule === 'free') {
    return 'entitled';
  }

  if (!session) {
    return 'need_sign_in';
  }

  const active = entitlements.filter(
    (e) => e.user_id === session.user_id && !isExpired(e.expires_at, now),
  );

  if (rule === 'members') {
    const hasMember = active.some((e) => e.kind === 'member');
    return hasMember ? 'entitled' : 'need_member';
  }

  // special_pay
  const hasFilmGrant = active.some(
    (e) =>
      (e.kind === 'special_pay' || e.kind === 'admin_grant') &&
      matchesFilm(e, filmSlug, filmId),
  );
  return hasFilmGrant ? 'entitled' : 'need_special_pay';
}

/** Format integer cents as rupees display string (e.g. 49900 → "499.00"). */
export function centsToRupeesDisplay(cents: number): string {
  const n = Number.isFinite(cents) ? cents : 0;
  return (n / 100).toFixed(2);
}

/** Parse rupees input (string or number) to integer cents. */
export function rupeesToCents(rupees: string | number): number {
  const n = typeof rupees === 'number' ? rupees : Number.parseFloat(String(rupees).trim());
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}
