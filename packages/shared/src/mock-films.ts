import type { Film } from './types';

/** Empty until org FilmyAI uploads — Anthony content lock (no sample/demo films). */
export const MOCK_FILMS: Film[] = [];

/** Slug used by viewer demo IA stub routes (not a catalog title). */
export const PLACEHOLDER_SLUG = 'placeholder';

export function isPlaceholderSlug(slug: string): boolean {
  return slug === PLACEHOLDER_SLUG;
}

export function getFilmBySlug(slug: string): Film | undefined {
  return MOCK_FILMS.find((f) => f.slug === slug);
}

export function getFilmsByGenre(genre: string): Film[] {
  return MOCK_FILMS.filter((f) => f.genre === genre && f.published);
}
