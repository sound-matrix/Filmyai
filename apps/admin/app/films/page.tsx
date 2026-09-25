'use client';

import Link from 'next/link';
import { DangerButton } from '../../components/FormFields';
import { useStudio } from '../../components/StudioProvider';

export default function FilmsListPage() {
  const { films, toggleFilmPublished, deleteFilm } = useStudio();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Films</h1>
          <p className="text-studio-muted">
            Film type shells · path/text refs · MOCK_FILMS stays empty (content lock)
          </p>
        </div>
        <Link
          href="/films/new"
          className="inline-flex min-h-11 items-center rounded-md bg-studio-accent px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
        >
          New film
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="bg-studio-panel text-studio-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Genre</th>
              <th className="px-4 py-3 font-medium">Access</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {films.length === 0 ? (
              <tr className="border-t border-zinc-800">
                <td colSpan={6} className="px-4 py-8 text-center text-studio-muted">
                  No local films · create a placeholder shell (no Last Voicemail / Still Typing)
                </td>
              </tr>
            ) : (
              films.map((film) => (
                <tr key={film.id} className="border-t border-zinc-800">
                  <td className="px-4 py-3 font-medium">{film.title}</td>
                  <td className="px-4 py-3 text-studio-muted">{film.slug}</td>
                  <td className="px-4 py-3">{film.genre || '—'}</td>
                  <td className="px-4 py-3">{film.access_rule}</td>
                  <td className="px-4 py-3">
                    {film.published ? (
                      <span className="text-green-400">Published</span>
                    ) : (
                      <span className="text-amber-400">Draft</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/films/${film.id}`}
                        className="rounded border border-zinc-700 px-3 py-1.5 text-xs hover:border-zinc-500"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleFilmPublished(film.id)}
                        className="rounded border border-zinc-700 px-3 py-1.5 text-xs hover:border-studio-accent"
                      >
                        {film.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <DangerButton onClick={() => deleteFilm(film.id)}>Delete</DangerButton>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
