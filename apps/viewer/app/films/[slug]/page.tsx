import Link from 'next/link';
import { getFilmBySlug, isPlaceholderSlug } from '@filmyai/shared';
import { FilmDetailStub } from '../../../components/FilmDetailStub';

type Props = { params: Promise<{ slug: string }> };

/**
 * Dynamic film detail. Placeholder / missing catalog → stub UI (no 404).
 * Real catalog titles are not seeded (Anthony content lock).
 */
export default async function FilmDetailPage({ params }: Props) {
  const { slug } = await params;

  if (isPlaceholderSlug(slug)) {
    return <FilmDetailStub />;
  }

  const film = getFilmBySlug(slug);
  if (!film) {
    return (
      <div>
        <FilmDetailStub />
        <p className="mt-8 text-center text-xs text-filmy-muted">
          No catalog entry for &ldquo;{slug}&rdquo; · showing placeholder stub
        </p>
        <p className="mt-2 text-center text-xs">
          <Link href="/" className="text-filmy-accent hover:underline">
            ← Home
          </Link>
        </p>
      </div>
    );
  }

  return (
    <article>
      <div className="mb-6 flex aspect-video items-center justify-center rounded-xl bg-zinc-800 text-filmy-muted">
        Backdrop placeholder · {film.backdrop_path || 'empty'}
      </div>
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex h-56 w-40 shrink-0 items-center justify-center rounded-lg bg-filmy-card text-center text-sm text-filmy-muted sm:h-64 sm:w-44">
          Poster
          <br />
          {film.poster_path || 'empty'}
        </div>
        <div className="flex-1">
          <p className="mb-1 text-sm uppercase tracking-wide text-filmy-muted">{film.genre}</p>
          <h1 className="mb-3 text-2xl font-bold sm:text-3xl">{film.title}</h1>
          <p className="mb-4 text-filmy-muted">{film.synopsis}</p>
          <p className="mb-6 text-sm">
            Access: <span className="font-medium text-white">{film.access_rule}</span>
          </p>
          <Link
            href={`/watch/${film.slug}`}
            className="inline-flex min-h-11 items-center rounded-md bg-filmy-accent px-6 py-3 font-semibold text-white transition hover:bg-red-700"
          >
            Play
          </Link>
        </div>
      </div>
    </article>
  );
}
