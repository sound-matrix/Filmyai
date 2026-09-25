'use client';

import Link from 'next/link';
import { DangerButton } from '../../components/FormFields';
import { useStudio } from '../../components/StudioProvider';

export default function BannersListPage() {
  const { banners, deleteBanner } = useStudio();
  const sorted = [...banners].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Banners</h1>
          <p className="text-studio-muted">Spotlight shells · image path text only</p>
        </div>
        <Link
          href="/banners/new"
          className="inline-flex min-h-11 items-center rounded-md bg-studio-accent px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
        >
          New banner
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="bg-studio-panel text-studio-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Image path</th>
              <th className="px-4 py-3 font-medium">Active</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr className="border-t border-zinc-800">
                <td colSpan={5} className="px-4 py-8 text-center text-studio-muted">
                  No banners yet · create a shell for the walkthrough
                </td>
              </tr>
            ) : (
              sorted.map((b) => (
                <tr key={b.id} className="border-t border-zinc-800">
                  <td className="px-4 py-3">{b.sort_order}</td>
                  <td className="px-4 py-3 font-medium">{b.title}</td>
                  <td className="max-w-[12rem] truncate px-4 py-3 text-studio-muted">
                    {b.image_path || '—'}
                  </td>
                  <td className="px-4 py-3">
                    {b.active ? (
                      <span className="text-green-400">Active</span>
                    ) : (
                      <span className="text-studio-muted">Off</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/banners/${b.id}`}
                        className="rounded border border-zinc-700 px-3 py-1.5 text-xs hover:border-zinc-500"
                      >
                        Edit
                      </Link>
                      <DangerButton onClick={() => deleteBanner(b.id)}>Delete</DangerButton>
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
