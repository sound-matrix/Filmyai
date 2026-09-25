import Link from 'next/link';
import { PLACEHOLDER_SLUG } from '@filmyai/shared';

/** Film detail empty-state for walkthrough — no catalog / media required. */
export function FilmDetailStub() {
  return (
    <article>
      <div className="mb-6 flex aspect-video items-center justify-center rounded-xl bg-filmy-elevated text-center text-sm text-filmy-muted">
        Backdrop placeholder · awaiting FilmyAI upload
      </div>
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex h-56 w-40 shrink-0 items-center justify-center rounded-lg bg-filmy-surface text-center text-sm text-filmy-muted sm:h-64 sm:w-44">
          Poster
          <br />
          Empty
        </div>
        <div className="flex-1">
          <p className="mb-1 text-sm uppercase tracking-wide text-filmy-muted">—</p>
          <h1 className="mb-3 font-display text-2xl font-bold sm:text-3xl">Title placeholder</h1>
          <p className="mb-4 text-filmy-muted">Awaiting FilmyAI upload</p>
          <p className="mb-6 text-sm">
            Access:{' '}
            <span className="font-medium text-filmy-fg">members</span>
            <span className="text-filmy-muted"> · staging stub</span>
          </p>
          <Link
            href={`/watch/${PLACEHOLDER_SLUG}`}
            className="inline-flex min-h-11 items-center rounded-md bg-filmy-accent px-6 py-3 font-semibold text-filmy-on-accent transition hover:bg-filmy-accent-hover active:bg-filmy-accent-pressed"
          >
            Play
          </Link>
        </div>
      </div>
    </article>
  );
}
