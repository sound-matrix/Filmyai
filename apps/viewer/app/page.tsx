import Link from 'next/link';
import { MOCK_FILMS, type Film } from '@filmyai/shared';

function FilmCard({ film }: { film: Film }) {
  return (
    <Link
      href={`/films/${film.slug}`}
      className="group block w-40 shrink-0 overflow-hidden rounded-lg bg-filmy-card transition hover:ring-2 hover:ring-filmy-accent"
    >
      <div className="flex aspect-[2/3] items-center justify-center bg-zinc-800 text-center text-xs text-filmy-muted">
        Poster
        <br />
        <span className="mt-1 block px-2 font-medium text-white/80">{film.title}</span>
      </div>
      <div className="p-2">
        <p className="truncate text-sm font-medium group-hover:text-filmy-accent">{film.title}</p>
        <p className="text-xs text-filmy-muted">{film.access_rule}</p>
      </div>
    </Link>
  );
}

function GenreRow({ genre, films }: { genre: string; films: Film[] }) {
  if (films.length === 0) return null;
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-lg font-semibold">{genre}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {films.map((film) => (
          <FilmCard key={film.id} film={film} />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const published = MOCK_FILMS.filter((f) => f.published);
  const genres = [...new Set(published.map((f) => f.genre))];

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Home</h1>
      <p className="mb-8 text-filmy-muted">Browse placeholder films · SOU-11 scaffold</p>
      {genres.map((genre) => (
        <GenreRow
          key={genre}
          genre={genre}
          films={published.filter((f) => f.genre === genre)}
        />
      ))}
    </div>
  );
}
