import { MOCK_FILMS } from '@filmyai/shared';

export default function AdminDashboardPage() {
  const total = MOCK_FILMS.length;
  const published = MOCK_FILMS.filter((f) => f.published).length;
  const drafts = total - published;

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Dashboard</h1>
      <p className="mb-8 text-studio-muted">Admin studio stub · SOU-11 · no live data yet</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-studio-panel p-6">
          <p className="text-sm text-studio-muted">Total films</p>
          <p className="mt-1 text-3xl font-bold">{total}</p>
        </div>
        <div className="rounded-lg bg-studio-panel p-6">
          <p className="text-sm text-studio-muted">Published</p>
          <p className="mt-1 text-3xl font-bold text-green-400">{published}</p>
        </div>
        <div className="rounded-lg bg-studio-panel p-6">
          <p className="text-sm text-studio-muted">Drafts</p>
          <p className="mt-1 text-3xl font-bold text-amber-400">{drafts}</p>
        </div>
      </div>
    </div>
  );
}
