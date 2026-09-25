import Link from 'next/link';
import { PLACEHOLDER_SLUG } from '@filmyai/shared';

/** Full-width hero shell for Product Lead walkthrough — no real artwork/media. */
export function SpotlightBanner() {
  return (
    <section className="relative mb-8 overflow-hidden rounded-xl bg-filmy-elevated">
      <div className="flex aspect-[16/9] w-full flex-col justify-end bg-gradient-to-t from-black via-filmy-surface/80 to-filmy-elevated sm:aspect-[21/9]">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="px-4 text-center text-sm text-filmy-muted sm:text-base">
            Spotlight placeholder · awaiting FilmyAI upload
          </p>
        </div>
        <div className="relative z-10 space-y-3 p-4 sm:p-8">
          <p className="text-xs uppercase tracking-widest text-filmy-muted">Featured</p>
          <h1 className="font-display text-2xl font-bold sm:text-3xl md:text-4xl">
            Title placeholder
          </h1>
          <p className="max-w-xl text-sm text-filmy-muted sm:text-base">
            Awaiting FilmyAI upload · empty hero for staging walkthrough
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href={`/films/${PLACEHOLDER_SLUG}`}
              className="inline-flex min-h-11 items-center rounded-md bg-filmy-accent px-5 py-2.5 text-sm font-semibold text-filmy-on-accent transition hover:bg-filmy-accent-hover active:bg-filmy-accent-pressed"
            >
              View details
            </Link>
            <Link
              href={`#browse`}
              className="inline-flex min-h-11 items-center rounded-md border border-filmy-ghost bg-transparent px-5 py-2.5 text-sm font-medium text-filmy-muted transition hover:border-filmy-muted hover:text-filmy-fg"
            >
              Browse
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
