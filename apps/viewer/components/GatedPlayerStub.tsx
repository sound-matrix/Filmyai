import Link from 'next/link';
import { PLACEHOLDER_SLUG } from '@filmyai/shared';

/** Membership/sign-in gate + empty black player frame — no media sources. */
export function GatedPlayerStub() {
  return (
    <div>
      <div className="relative mb-4 overflow-hidden rounded-xl border border-zinc-700 bg-black">
        <div className="flex aspect-video items-center justify-center">
          <div className="pointer-events-none absolute inset-0 bg-zinc-950" aria-hidden />
          <div className="relative z-10 mx-4 max-w-md rounded-lg border border-zinc-600 bg-filmy-card/95 p-5 text-center shadow-xl sm:p-6">
            <p className="mb-1 text-xs uppercase tracking-widest text-filmy-muted">Access gate</p>
            <h2 className="mb-2 text-lg font-semibold text-white sm:text-xl">
              Sign in / member access required
            </h2>
            <p className="mb-4 text-sm text-filmy-muted">
              Playback is gated for staging walkthrough. No media is loaded — empty player frame
              only (Anthony content lock).
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <span className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-md bg-zinc-700 px-5 py-2.5 text-sm font-semibold text-filmy-muted">
                Sign in (stub)
              </span>
              <Link
                href={`/films/${PLACEHOLDER_SLUG}`}
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-600 px-5 py-2.5 text-sm font-medium text-white transition hover:border-zinc-400"
              >
                Back to detail
              </Link>
            </div>
          </div>
        </div>
      </div>
      <h1 className="mb-2 text-xl font-bold sm:text-2xl">Title placeholder</h1>
      <p className="mb-3 text-sm text-filmy-muted">Awaiting FilmyAI upload · gated player stub</p>
      <Link
        href={`/films/${PLACEHOLDER_SLUG}`}
        className="text-sm text-filmy-accent hover:underline"
      >
        ← Back to detail
      </Link>
    </div>
  );
}
