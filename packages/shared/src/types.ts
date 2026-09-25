export type AccessRule = 'public' | 'members' | 'paid';

export type Film = {
  id: string;
  slug: string;
  title: string;
  synopsis: string;
  genre: string;
  poster_path: string;
  backdrop_path: string;
  access_rule: AccessRule;
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

/** Member access grant/revoke shell — no auth backend in week-1 MVP. */
export type MemberGrant = {
  id: string;
  email: string;
  reason: string;
  granted_at: string;
  revoked_at: string | null;
};

/** Staging auth session shell — local mock only until Supabase keys land. */
export type AuthSession = {
  user_id: string;
  email: string;
  role: 'viewer' | 'admin';
  display_name: string;
  /** ISO timestamp; mock sessions may omit expiry. */
  expires_at?: string | null;
};

/**
 * Catalog entitlement (one-time / admin-grant style).
 * Pricing TBD — demo may use admin-grant via granted_by.
 */
export type Entitlement = {
  id: string;
  user_id: string;
  /** Prefer film_id when catalog IDs exist; slug for placeholder walkthrough. */
  film_id?: string | null;
  film_slug?: string | null;
  reason: string;
  granted_by: 'admin' | 'purchase' | 'promo' | 'mock';
  created_at: string;
  expires_at?: string | null;
};

/** Soft auth/entitlement gate states for UI shells (no live Stripe/Supabase). */
export type EntitlementGateState =
  | 'signed_out'
  | 'signed_in_no_entitlement'
  | 'entitled';
