'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  AccessRule,
  Banner,
  Collection,
  CollectionVisibility,
  Film,
  MemberGrant,
  PricingSettings,
} from '@filmyai/shared';
import { normalizeAccessRule } from '@filmyai/shared';
import { getBrowserAccessToken } from '../lib/browser-access-token';
import { isSupabaseConfigured } from '../lib/supabase';

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function slugify(title: string) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return base || 'untitled';
}

const PRICING_STORAGE_KEY = 'filmyai.admin.pricing.local.v1';

const DEFAULT_PRICING: PricingSettings = {
  member_price_cents: 49900,
  member_currency: 'INR',
  updated_at: new Date(0).toISOString(),
};

type StudioState = {
  banners: Banner[];
  films: Film[];
  collections: Collection[];
  grants: MemberGrant[];
  pricing: PricingSettings;
  pricingSource: 'local' | 'supabase' | 'loading';
  pricingMessage: string | null;
};

type BannerInput = {
  title: string;
  image_path: string;
  active: boolean;
  sort_order: number;
};

export type FilmInput = {
  title: string;
  slug?: string;
  synopsis: string;
  genre: string;
  poster_path: string;
  backdrop_path: string;
  access_rule: AccessRule;
  special_pay_price_cents: number | null;
  launch_at: string;
  published: boolean;
  playback_package_key: string;
};

type CollectionInput = {
  name: string;
  visibility: CollectionVisibility;
  film_slugs: string[];
};

type StudioContextValue = StudioState & {
  createBanner: (input: BannerInput) => Banner;
  updateBanner: (id: string, input: BannerInput) => Banner | undefined;
  deleteBanner: (id: string) => void;
  createFilm: (input: FilmInput) => Promise<Film>;
  updateFilm: (id: string, input: FilmInput) => Promise<Film | undefined>;
  toggleFilmPublished: (id: string) => void;
  deleteFilm: (id: string) => void;
  createCollection: (input: CollectionInput) => Collection;
  updateCollection: (id: string, input: CollectionInput) => Collection | undefined;
  reorderCollectionSlugs: (id: string, film_slugs: string[]) => void;
  deleteCollection: (id: string) => void;
  grantAccess: (email: string, reason: string) => MemberGrant;
  revokeAccess: (id: string) => void;
  setMemberPriceCents: (cents: number) => Promise<{ ok: boolean; message: string }>;
  refreshPricing: () => Promise<void>;
};

const StudioContext = createContext<StudioContextValue | null>(null);

const INITIAL: StudioState = {
  banners: [],
  films: [],
  collections: [],
  grants: [],
  pricing: DEFAULT_PRICING,
  pricingSource: 'loading',
  pricingMessage: null,
};

function loadLocalPricing(): PricingSettings {
  if (typeof window === 'undefined') return DEFAULT_PRICING;
  try {
    const raw = window.localStorage.getItem(PRICING_STORAGE_KEY);
    if (!raw) return DEFAULT_PRICING;
    const parsed = JSON.parse(raw) as Partial<PricingSettings>;
    return {
      member_price_cents:
        typeof parsed.member_price_cents === 'number'
          ? parsed.member_price_cents
          : DEFAULT_PRICING.member_price_cents,
      member_currency: parsed.member_currency || 'INR',
      updated_at: parsed.updated_at || nowIso(),
    };
  } catch {
    return DEFAULT_PRICING;
  }
}

function persistLocalPricing(pricing: PricingSettings) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(pricing));
}

async function upsertFilmAccess(input: {
  slug: string;
  access_rule: AccessRule;
  special_pay_price_cents: number | null;
}): Promise<string | null> {
  if (!isSupabaseConfigured()) return 'local only — Supabase not configured';
  const token = await getBrowserAccessToken();
  if (!token) return 'local only — admin session token unavailable for film_access upsert';

  try {
    const res = await fetch('/api/film-access', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !json.ok) {
      return json.error || `film_access upsert failed (${res.status})`;
    }
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : 'film_access upsert failed';
  }
}

export function StudioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudioState>(INITIAL);

  const refreshPricing = useCallback(async () => {
    try {
      const res = await fetch('/api/pricing');
      const json = (await res.json()) as {
        ok?: boolean;
        source?: string;
        pricing?: PricingSettings;
        message?: string;
      };
      if (json.pricing && json.source === 'supabase') {
        setState((s) => ({
          ...s,
          pricing: json.pricing!,
          pricingSource: 'supabase',
          pricingMessage: null,
        }));
        return;
      }
      const local = loadLocalPricing();
      setState((s) => ({
        ...s,
        pricing: local,
        pricingSource: 'local',
        pricingMessage:
          json.message ||
          'Local pricing only until migration 0003 is applied and Supabase env is set.',
      }));
    } catch {
      const local = loadLocalPricing();
      setState((s) => ({
        ...s,
        pricing: local,
        pricingSource: 'local',
        pricingMessage: 'Could not reach /api/pricing — using localStorage fallback.',
      }));
    }
  }, []);

  useEffect(() => {
    void refreshPricing();
  }, [refreshPricing]);

  const setMemberPriceCents = useCallback(
    async (cents: number): Promise<{ ok: boolean; message: string }> => {
      if (!Number.isInteger(cents) || cents < 0) {
        return { ok: false, message: 'Price must be a non-negative integer (cents).' };
      }

      const token = await getBrowserAccessToken();
      if (token && isSupabaseConfigured()) {
        try {
          const res = await fetch('/api/pricing', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              member_price_cents: cents,
              member_currency: 'INR',
            }),
          });
          const json = (await res.json()) as {
            ok?: boolean;
            pricing?: PricingSettings;
            error?: string;
          };
          if (res.ok && json.ok && json.pricing) {
            setState((s) => ({
              ...s,
              pricing: json.pricing!,
              pricingSource: 'supabase',
              pricingMessage: null,
            }));
            return { ok: true, message: 'Member price saved to pricing_settings.' };
          }
          // Soft-fail to local
          const pricing: PricingSettings = {
            member_price_cents: cents,
            member_currency: 'INR',
            updated_at: nowIso(),
          };
          persistLocalPricing(pricing);
          setState((s) => ({
            ...s,
            pricing,
            pricingSource: 'local',
            pricingMessage:
              json.error ||
              'Saved locally only — pricing_settings write failed (apply migration 0003?).',
          }));
          return {
            ok: true,
            message:
              json.error ||
              'Saved locally only until migration 0003 is applied / service role works.',
          };
        } catch {
          // fall through to local
        }
      }

      const pricing: PricingSettings = {
        member_price_cents: cents,
        member_currency: 'INR',
        updated_at: nowIso(),
      };
      persistLocalPricing(pricing);
      setState((s) => ({
        ...s,
        pricing,
        pricingSource: 'local',
        pricingMessage: 'Local only until migration 0003 is applied and Supabase env is set.',
      }));
      return {
        ok: true,
        message: 'Saved locally only until migration 0003 is applied and Supabase env is set.',
      };
    },
    [],
  );

  const createBanner = useCallback((input: BannerInput) => {
    const ts = nowIso();
    const banner: Banner = { id: uid('ban'), ...input, created_at: ts, updated_at: ts };
    setState((s) => ({ ...s, banners: [...s.banners, banner] }));
    return banner;
  }, []);

  const updateBanner = useCallback((id: string, input: BannerInput) => {
    let updated: Banner | undefined;
    setState((s) => ({
      ...s,
      banners: s.banners.map((b) => {
        if (b.id !== id) return b;
        updated = { ...b, ...input, updated_at: nowIso() };
        return updated;
      }),
    }));
    return updated;
  }, []);

  const deleteBanner = useCallback((id: string) => {
    setState((s) => ({ ...s, banners: s.banners.filter((b) => b.id !== id) }));
  }, []);

  const createFilm = useCallback(async (input: FilmInput) => {
    const ts = nowIso();
    const access_rule = normalizeAccessRule(input.access_rule);
    const special_pay_price_cents =
      access_rule === 'special_pay' ? input.special_pay_price_cents : null;
    const film: Film = {
      id: uid('film'),
      slug: input.slug?.trim() || slugify(input.title),
      title: input.title,
      synopsis: input.synopsis,
      genre: input.genre,
      poster_path: input.poster_path,
      backdrop_path: input.backdrop_path,
      access_rule,
      special_pay_price_cents,
      launch_at: input.launch_at || ts,
      published: input.published,
      playback_package_key: input.playback_package_key,
      created_at: ts,
      updated_at: ts,
    };
    setState((s) => ({ ...s, films: [...s.films, film] }));
    await upsertFilmAccess({
      slug: film.slug,
      access_rule: film.access_rule,
      special_pay_price_cents: film.special_pay_price_cents,
    });
    return film;
  }, []);

  const updateFilm = useCallback(async (id: string, input: FilmInput) => {
    let updated: Film | undefined;
    const access_rule = normalizeAccessRule(input.access_rule);
    const special_pay_price_cents =
      access_rule === 'special_pay' ? input.special_pay_price_cents : null;
    setState((s) => ({
      ...s,
      films: s.films.map((f) => {
        if (f.id !== id) return f;
        updated = {
          ...f,
          title: input.title,
          slug: input.slug?.trim() || f.slug,
          synopsis: input.synopsis,
          genre: input.genre,
          poster_path: input.poster_path,
          backdrop_path: input.backdrop_path,
          access_rule,
          special_pay_price_cents,
          launch_at: input.launch_at || f.launch_at,
          published: input.published,
          playback_package_key: input.playback_package_key,
          updated_at: nowIso(),
        };
        return updated;
      }),
    }));
    if (updated) {
      await upsertFilmAccess({
        slug: updated.slug,
        access_rule: updated.access_rule,
        special_pay_price_cents: updated.special_pay_price_cents,
      });
    }
    return updated;
  }, []);

  const toggleFilmPublished = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      films: s.films.map((f) =>
        f.id === id ? { ...f, published: !f.published, updated_at: nowIso() } : f,
      ),
    }));
  }, []);

  const deleteFilm = useCallback((id: string) => {
    setState((s) => ({ ...s, films: s.films.filter((f) => f.id !== id) }));
  }, []);

  const createCollection = useCallback((input: CollectionInput) => {
    const ts = nowIso();
    const collection: Collection = {
      id: uid('col'),
      name: input.name,
      visibility: input.visibility,
      film_slugs: input.film_slugs,
      created_at: ts,
      updated_at: ts,
    };
    setState((s) => ({ ...s, collections: [...s.collections, collection] }));
    return collection;
  }, []);

  const updateCollection = useCallback((id: string, input: CollectionInput) => {
    let updated: Collection | undefined;
    setState((s) => ({
      ...s,
      collections: s.collections.map((c) => {
        if (c.id !== id) return c;
        updated = { ...c, ...input, updated_at: nowIso() };
        return updated;
      }),
    }));
    return updated;
  }, []);

  const reorderCollectionSlugs = useCallback((id: string, film_slugs: string[]) => {
    setState((s) => ({
      ...s,
      collections: s.collections.map((c) =>
        c.id === id ? { ...c, film_slugs, updated_at: nowIso() } : c,
      ),
    }));
  }, []);

  const deleteCollection = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      collections: s.collections.filter((c) => c.id !== id),
    }));
  }, []);

  const grantAccess = useCallback((email: string, reason: string) => {
    const grant: MemberGrant = {
      id: uid('grant'),
      email: email.trim().toLowerCase(),
      reason: reason.trim() || 'admin_grant',
      granted_at: nowIso(),
      revoked_at: null,
    };
    setState((s) => ({ ...s, grants: [grant, ...s.grants] }));
    return grant;
  }, []);

  const revokeAccess = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      grants: s.grants.map((g) =>
        g.id === id && !g.revoked_at ? { ...g, revoked_at: nowIso() } : g,
      ),
    }));
  }, []);

  const value = useMemo<StudioContextValue>(
    () => ({
      ...state,
      createBanner,
      updateBanner,
      deleteBanner,
      createFilm,
      updateFilm,
      toggleFilmPublished,
      deleteFilm,
      createCollection,
      updateCollection,
      reorderCollectionSlugs,
      deleteCollection,
      grantAccess,
      revokeAccess,
      setMemberPriceCents,
      refreshPricing,
    }),
    [
      state,
      createBanner,
      updateBanner,
      deleteBanner,
      createFilm,
      updateFilm,
      toggleFilmPublished,
      deleteFilm,
      createCollection,
      updateCollection,
      reorderCollectionSlugs,
      deleteCollection,
      grantAccess,
      revokeAccess,
      setMemberPriceCents,
      refreshPricing,
    ],
  );

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error('useStudio must be used within StudioProvider');
  return ctx;
}
