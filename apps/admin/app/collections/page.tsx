'use client';

import Link from 'next/link';
import { DangerButton } from '../../components/FormFields';
import { useStudio } from '../../components/StudioProvider';

export default function CollectionsListPage() {
  const { collections, deleteCollection } = useStudio();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Collections</h1>
          <p className="text-studio-muted">Name · visibility · ordered film slug placeholders</p>
        </div>
        <Link
          href="/collections/new"
          className="inline-flex min-h-11 items-center rounded-md bg-studio-accent px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
        >
          New collection
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="bg-studio-panel text-studio-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Visibility</th>
              <th className="px-4 py-3 font-medium">Slugs</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {collections.length === 0 ? (
              <tr className="border-t border-zinc-800">
                <td colSpan={4} className="px-4 py-8 text-center text-studio-muted">
                  No collections yet · add ordered slug placeholders for the walkthrough
                </td>
              </tr>
            ) : (
              collections.map((c) => (
                <tr key={c.id} className="border-t border-zinc-800">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">{c.visibility}</td>
                  <td className="px-4 py-3 text-studio-muted">
                    {c.film_slugs.length === 0 ? '—' : c.film_slugs.join(', ')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/collections/${c.id}`}
                        className="rounded border border-zinc-700 px-3 py-1.5 text-xs hover:border-zinc-500"
                      >
                        Edit / reorder
                      </Link>
                      <DangerButton onClick={() => deleteCollection(c.id)}>Delete</DangerButton>
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
