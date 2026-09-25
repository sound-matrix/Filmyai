'use client';

import {
  createContext,
  useCallback,
  useContext,
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
} from '@filmyai/shared';

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

type StudioState = {
  banners: Banner[];
  films: Film[];
  collections: Collection[];
  grants: MemberGrant[];
};

type BannerInput = {
  title: string;
  image_path: string;
  active: boolean;
  sort_order: number;
};

type FilmInput = {
  title: string;
  slug?: string;
  synopsis: string;
  genre: string;
  poster_path: string;
  backdrop_path: string;
  access_rule: AccessRule;
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
  createFilm: (input: FilmInput) => Film;
  updateFilm: (id: string, input: FilmInput) => Film | undefined;
  toggleFilmPublished: (id: string) => void;
  deleteFilm: (id: string) => void;
  createCollection: (input: CollectionInput) => Collection;
  updateCollection: (id: string, input: CollectionInput) => Collection | undefined;
  reorderCollectionSlugs: (id: string, film_slugs: string[]) => void;
  deleteCollection: (id: string) => void;
  grantAccess: (email: string, reason: string) => MemberGrant;
  revokeAccess: (id: string) => void;
};

const StudioContext = createContext<StudioContextValue | null>(null);

const INITIAL: StudioState = {
  banners: [],
  films: [],
  collections: [],
  grants: [],
};

export function StudioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudioState>(INITIAL);

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

  const createFilm = useCallback((input: FilmInput) => {
    const ts = nowIso();
    const film: Film = {
      id: uid('film'),
      slug: input.slug?.trim() || slugify(input.title),
      title: input.title,
      synopsis: input.synopsis,
      genre: input.genre,
      poster_path: input.poster_path,
      backdrop_path: input.backdrop_path,
      access_rule: input.access_rule,
      launch_at: input.launch_at || ts,
      published: input.published,
      playback_package_key: input.playback_package_key,
      created_at: ts,
      updated_at: ts,
    };
    setState((s) => ({ ...s, films: [...s.films, film] }));
    return film;
  }, []);

  const updateFilm = useCallback((id: string, input: FilmInput) => {
    let updated: Film | undefined;
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
          access_rule: input.access_rule,
          launch_at: input.launch_at || f.launch_at,
          published: input.published,
          playback_package_key: input.playback_package_key,
          updated_at: nowIso(),
        };
        return updated;
      }),
    }));
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
      reason: reason.trim(),
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
    ],
  );

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error('useStudio must be used within StudioProvider');
  return ctx;
}
