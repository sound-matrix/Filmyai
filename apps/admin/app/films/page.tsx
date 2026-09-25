import Link from 'next/link';
import { MOCK_FILMS } from '@filmyai/shared';

export default function FilmsListPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Films</h1>
          <p className="text-studio-muted">Mock list · Supabase writes later</p>
        </div>
        <Link
          href="/films/new"
          className="rounded-md bg-studio-accent px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
        >
          New film
        </Link>
      </div>
      <div className="overflow-hidden rounded-lg border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-studio-panel text-studio-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Genre</th>
              <th className="px-4 py-3 font-medium">Access</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_FILMS.map((film) => (
              <tr key={film.id} className="border-t border-zinc-800">
                <td className="px-4 py-3 font-medium">{film.title}</td>
                <td className="px-4 py-3">{film.genre}</td>
                <td className="px-4 py-3">{film.access_rule}</td>
                <td className="px-4 py-3">
                  {film.published ? (
                    <span className="text-green-400">Published</span>
                  ) : (
                    <span className="text-amber-400">Draft</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
