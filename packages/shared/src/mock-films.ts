import type { Film } from './types';

/** Empty until org FilmyAI uploads — Anthony content lock (no sample/demo films). */
export const MOCK_FILMS: Film[] = [];

export function getFilmBySlug(slug: string): Film | undefined {
  return MOCK_FILMS.find((f) => f.slug === slug);
}

export function getFilmsByGenre(genre: string): Film[] {
  return MOCK_FILMS.filter((f) => f.genre === genre && f.published);
}
