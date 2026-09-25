import Link from 'next/link';
import { PLACEHOLDER_SLUG } from '@filmyai/shared';

type Props = {
  index?: number;
};

/** Empty poster shell — links to placeholder detail (content lock). */
export function PosterCard({ index }: Props) {
  return (
    <Link
      href={`/films/${PLACEHOLDER_SLUG}`}
      className="block w-36 shrink-0 overflow-hidden rounded-lg bg-filmy-elevated transition hover:ring-2 hover:ring-filmy-accent/60 sm:w-40"
    >
      <div className="flex aspect-[2/3] items-center justify-center bg-filmy-surface px-2 text-center text-xs text-filmy-muted">
        Empty · awaiting FilmyAI uploads
      </div>
      <div className="p-2">
        <p className="truncate text-sm text-filmy-muted">
          Title placeholder{index != null ? ` ${index + 1}` : ''}
        </p>
        <p className="text-xs text-filmy-muted">—</p>
      </div>
    </Link>
  );
}
