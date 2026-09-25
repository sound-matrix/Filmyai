import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getFilmBySlug } from '@filmyai/shared';

type Props = { params: Promise<{ slug: string }> };

export default async function FilmDetailPage({ params }: Props) {
  const { slug } = await params;
  const film = getFilmBySlug(slug);
  if (!film) notFound();

  return (
    <article>
      <div className="mb-6 flex aspect-video items-center justify-center rounded-xl bg-zinc-800 text-filmy-muted">
        Backdrop placeholder · {film.backdrop_path}
      </div>
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex h-64 w-44 shrink-0 items-center justify-center rounded-lg bg-filmy-card text-center text-sm text-filmy-muted">
          Poster
          <br />
          {film.poster_path}
        </div>
        <div className="flex-1">
          <p className="mb-1 text-sm uppercase tracking-wide text-filmy-muted">{film.genre}</p>
          <h1 className="mb-3 text-3xl font-bold">{film.title}</h1>
          <p className="mb-4 text-filmy-muted">{film.synopsis}</p>
          <p className="mb-6 text-sm">
            Access: <span className="font-medium text-white">{film.access_rule}</span>
          </p>
          <Link
            href={`/watch/${film.slug}`}
            className="inline-block rounded-md bg-filmy-accent px-6 py-3 font-semibold text-white transition hover:bg-red-700"
          >
            Play
          </Link>
        </div>
      </div>
    </article>
  );
}
