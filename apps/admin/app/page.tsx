'use client';

import Link from 'next/link';
import { useStudio } from '../components/StudioProvider';

const SECTIONS = [
  { href: '/banners', label: 'Banners', key: 'banners' as const },
  { href: '/films', label: 'Films', key: 'films' as const },
  { href: '/collections', label: 'Collections', key: 'collections' as const },
  { href: '/access', label: 'Access grants', key: 'grants' as const },
] as const;

export default function AdminDashboardPage() {
  const studio = useStudio();
  const published = studio.films.filter((f) => f.published).length;
  const activeBanners = studio.banners.filter((b) => b.active).length;
  const activeGrants = studio.grants.filter((g) => !g.revoked_at).length;

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Dashboard</h1>
      <p className="mb-8 text-studio-muted">
        Admin MVP shells · local in-memory state · no Supabase writes · no Drive uploads
      </p>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Banners" value={studio.banners.length} sub={`${activeBanners} active`} />
        <Stat
          label="Films"
          value={studio.films.length}
          sub={`${published} published · ${studio.films.length - published} draft`}
        />
        <Stat label="Collections" value={studio.collections.length} sub="ordered slug shells" />
        <Stat label="Access" value={activeGrants} sub={`${studio.grants.length} total grants`} />
      </div>

      <h2 className="mb-3 text-lg font-semibold">Sections</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="flex min-h-14 items-center justify-between rounded-lg border border-zinc-800 bg-studio-panel px-4 py-3 hover:border-studio-accent"
          >
            <span className="font-medium">{s.label}</span>
            <span className="text-sm text-studio-muted">{studio[s.key].length}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="rounded-lg bg-studio-panel p-5">
      <p className="text-sm text-studio-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-studio-muted">{sub}</p>
    </div>
  );
}
