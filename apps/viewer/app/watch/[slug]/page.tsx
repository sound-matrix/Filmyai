import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getFilmBySlug } from '@filmyai/shared';

type Props = { params: Promise<{ slug: string }> };

export default async function WatchPage({ params }: Props) {
  const { slug } = await params;
  const film = getFilmBySlug(slug);
  if (!film) notFound();

  return (
    <div>
      <div className="mb-4 flex aspect-video items-center justify-center rounded-xl border border-zinc-700 bg-black text-filmy-muted">
        <div className="text-center">
          <p className="mb-2 text-lg font-medium text-white">Playback stub</p>
          <p className="text-sm">Package: {film.playback_package_key}</p>
          <p className="mt-4 text-xs">Player / CDN wiring out of scope for SOU-11</p>
        </div>
      </div>
      <h1 className="mb-2 text-2xl font-bold">{film.title}</h1>
      <Link href={`/films/${film.slug}`} className="text-sm text-filmy-accent hover:underline">
        ← Back to detail
      </Link>
    </div>
  );
}
