import type { Film } from './types';

export const MOCK_FILMS: Film[] = [
  {
    id: '1',
    slug: 'midnight-rain',
    title: 'Midnight Rain',
    synopsis:
      'A jazz pianist in Mumbai discovers a forgotten melody that unlocks memories of a lost love across decades.',
    genre: 'Drama',
    poster_path: '/placeholders/midnight-rain-poster.jpg',
    backdrop_path: '/placeholders/midnight-rain-backdrop.jpg',
    access_rule: 'public',
    launch_at: '2026-01-15T00:00:00.000Z',
    published: true,
    playback_package_key: 'pkg_midnight_rain',
    created_at: '2025-12-01T00:00:00.000Z',
    updated_at: '2026-01-10T00:00:00.000Z',
  },
  {
    id: '2',
    slug: 'neon-monsoon',
    title: 'Neon Monsoon',
    synopsis:
      'Street racers chase glory through flooded monsoon nights in a cyberpunk reimagining of Chennai.',
    genre: 'Action',
    poster_path: '/placeholders/neon-monsoon-poster.jpg',
    backdrop_path: '/placeholders/neon-monsoon-backdrop.jpg',
    access_rule: 'members',
    launch_at: '2026-02-01T00:00:00.000Z',
    published: true,
    playback_package_key: 'pkg_neon_monsoon',
    created_at: '2025-12-15T00:00:00.000Z',
    updated_at: '2026-01-20T00:00:00.000Z',
  },
  {
    id: '3',
    slug: 'saffron-skies',
    title: 'Saffron Skies',
    synopsis:
      'A documentary following kite-makers in Rajasthan as tradition meets a changing climate.',
    genre: 'Documentary',
    poster_path: '/placeholders/saffron-skies-poster.jpg',
    backdrop_path: '/placeholders/saffron-skies-backdrop.jpg',
    access_rule: 'paid',
    launch_at: '2026-03-01T00:00:00.000Z',
    published: true,
    playback_package_key: 'pkg_saffron_skies',
    created_at: '2026-01-05T00:00:00.000Z',
    updated_at: '2026-02-01T00:00:00.000Z',
  },
  {
    id: '4',
    slug: 'echoes-of-goonj',
    title: 'Echoes of Goonj',
    synopsis:
      'A folk singer returns to her village to confront the silence left by a vanished river.',
    genre: 'Drama',
    poster_path: '/placeholders/echoes-of-goonj-poster.jpg',
    backdrop_path: '/placeholders/echoes-of-goonj-backdrop.jpg',
    access_rule: 'public',
    launch_at: '2026-04-01T00:00:00.000Z',
    published: false,
    playback_package_key: 'pkg_echoes_of_goonj',
    created_at: '2026-02-10T00:00:00.000Z',
    updated_at: '2026-02-10T00:00:00.000Z',
  },
];

export function getFilmBySlug(slug: string): Film | undefined {
  return MOCK_FILMS.find((f) => f.slug === slug);
}

export function getFilmsByGenre(genre: string): Film[] {
  return MOCK_FILMS.filter((f) => f.genre === genre && f.published);
}
