import { PosterCard } from './PosterCard';

type Props = {
  title: string;
  count?: number;
};

/** Labeled horizontal row of placeholder poster cards. */
export function DiscoveryRow({ title, count = 5 }: Props) {
  return (
    <section className="mb-8 sm:mb-10">
      <h2 className="mb-3 text-base font-semibold text-white sm:mb-4 sm:text-lg">{title}</h2>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 sm:gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <PosterCard key={`${title}-${i}`} index={i} />
        ))}
      </div>
    </section>
  );
}
