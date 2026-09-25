import { DiscoveryRow } from '../components/DiscoveryRow';
import { SpotlightBanner } from '../components/SpotlightBanner';

export default function HomePage() {
  return (
    <div>
      <SpotlightBanner />

      <div id="browse">
        <DiscoveryRow title="Featured" count={5} />
        <DiscoveryRow title="New" count={5} />
        <DiscoveryRow title="Genres" count={6} />
        <DiscoveryRow title="Continue watching" count={4} />
      </div>

      <p className="mt-2 text-center text-xs text-filmy-muted">
        Empty catalog · awaiting FilmyAI uploads · SOU-6 demo IA
      </p>
    </div>
  );
}
