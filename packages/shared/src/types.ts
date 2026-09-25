/**
 * Product access rule (SOU-14).
 * Canonical: 'free' | 'members' | 'special_pay'
 * Backward-compat aliases (normalize via normalizeAccessRule):
 *   'public' → 'free'
 *   'paid'   → 'special_pay'
 */
export type AccessRule = 'free' | 'members' | 'special_pay';

/** Legacy shells may still emit these; prefer AccessRule. */
export type AccessRuleAlias = AccessRule | 'public' | 'paid';

export type Film = {
  id: string;
  slug: string;
  title: string;
  synopsis: string;
  genre: string;
  poster_path: string;
  backdrop_path: string;
  access_rule: AccessRule;
  /**
   * One-time special-pay price in smallest currency unit (paise for INR).
   * Required when access_rule is special_pay; null/0 for free/members.
   */
  special_pay_price_cents: number | null;
  launch_at: string;
  published: boolean;
  playback_package_key: string;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  role: 'viewer' | 'admin';
  display_name: string;
};

/** Homepage / spotlight banner shell — image is a path/text ref only (no binary upload). */
export type Banner = {
  id: string;
  title: string;
  image_path: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CollectionVisibility = 'public' | 'members' | 'hidden';

/** Ordered film slug placeholders for discovery rows — local reorder in admin shell. */
export type Collection = {
  id: string;
  name: string;
  visibility: CollectionVisibility;
  film_slugs: string[];
  created_at: string;
  updated_at: string;
};

/** Member access grant/revoke shell — local admin_grant list in Studio. */
export type MemberGrant = {
  id: string;
  email: string;
  reason: string;
  granted_at: string;
  revoked_at: string | null;
};

/** Auth session shape for viewer/admin gates (Supabase-backed on admin SOU-13). */
export type AuthSession = {
  user_id: string;
  email: string;
  role: 'viewer' | 'admin';
  display_name: string;
  /** ISO timestamp; mock sessions may omit expiry. */
  expires_at?: string | null;
};

/**
 * Catalog entitlement kinds (SOU-14):
 * - member: catalog-wide subscription (film_id/film_slug may both be null)
 * - special_pay: one-time per-film purchase
 * - admin_grant: studio/manual film grant
 */
export type EntitlementKind = 'member' | 'special_pay' | 'admin_grant';

export type Entitlement = {
  id: string;
  user_id: string;
  kind: EntitlementKind;
  /** Prefer film_id when catalog IDs exist; slug for placeholder walkthrough. */
  film_id?: string | null;
  film_slug?: string | null;
  reason: string;
  granted_by: 'admin' | 'purchase' | 'promo' | 'mock';
  created_at: string;
  expires_at?: string | null;
};

/**
 * Soft auth/entitlement gate states for UI shells.
 * Practical for Free / Members / Special pay CTAs (checkout still SOU-15).
 */
export type EntitlementGateState =
  | 'free'
  | 'need_sign_in'
  | 'need_member'
  | 'need_special_pay'
  | 'entitled'
  /** @deprecated Prefer need_sign_in — kept for older shells. */
  | 'signed_out'
  /** @deprecated Prefer need_member / need_special_pay. */
  | 'signed_in_no_entitlement';

/** Singleton member subscription pricing (Admin Studio editable). Currency default INR. */
export type PricingSettings = {
  member_price_cents: number;
  member_currency: string;
  updated_at: string;
};

/** Persistable film access + special-pay price keyed by slug (CMS may still be local). */
export type FilmAccess = {
  id: string;
  slug: string;
  access_rule: AccessRule;
  special_pay_price_cents: number | null;
  updated_at: string;
};

/** Razorpay checkout order kind (SOU-15 test mode). */
export type PaymentOrderKind = 'member' | 'special_pay';

/** payment_orders.status values (staging Razorpay test mode). */
export type PaymentOrderStatus = 'created' | 'paid' | 'failed';
