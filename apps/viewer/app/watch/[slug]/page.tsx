import Link from 'next/link';
import { getFilmBySlug, isPlaceholderSlug } from '@filmyai/shared';
import { GatedPlayerStub } from '../../../components/GatedPlayerStub';

type Props = { params: Promise<{ slug: string }> };

/**
 * Watch route: gated stub only — no video sources / CDN (content lock).
 * Missing catalog entries still render the gate so walkthrough never 404s.
 */
export default async function WatchPage({ params }: Props) {
  const { slug } = await params;

  if (isPlaceholderSlug(slug)) {
    return <GatedPlayerStub />;
  }

  const film = getFilmBySlug(slug);
  if (!film) {
    return (
      <div>
        <GatedPlayerStub />
        <p className="mt-6 text-center text-xs text-filmy-muted">
          No catalog entry for &ldquo;{slug}&rdquo; · gated stub only
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative mb-4 overflow-hidden rounded-xl border border-zinc-700 bg-black">
        <div className="flex aspect-video items-center justify-center">
          <div className="relative z-10 mx-4 max-w-md rounded-lg border border-zinc-600 bg-filmy-card/95 p-5 text-center sm:p-6">
            <p className="mb-1 text-xs uppercase tracking-widest text-filmy-muted">Access gate</p>
            <h2 className="mb-2 text-lg font-semibold text-white">
              Sign in / member access required
            </h2>
            <p className="mb-2 text-sm text-filmy-muted">
              Package key reserved: {film.playback_package_key || '—'} · no media loaded
            </p>
            <span className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-md bg-zinc-700 px-5 py-2.5 text-sm font-semibold text-filmy-muted">
              Sign in (stub)
            </span>
          </div>
        </div>
      </div>
      <h1 className="mb-2 text-xl font-bold sm:text-2xl">{film.title}</h1>
      <Link href={`/films/${film.slug}`} className="text-sm text-filmy-accent hover:underline">
        ← Back to detail
      </Link>
    </div>
  );
}
