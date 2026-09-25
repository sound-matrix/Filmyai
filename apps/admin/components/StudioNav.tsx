'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/banners', label: 'Banners' },
  { href: '/films', label: 'Films' },
  { href: '/collections', label: 'Collections' },
  { href: '/access', label: 'Access' },
] as const;

function linkClass(active: boolean) {
  return [
    'rounded px-3 py-2.5 text-sm min-h-11 flex items-center',
    active ? 'bg-zinc-800 text-white' : 'text-studio-muted hover:bg-zinc-800 hover:text-white',
  ].join(' ');
}

export function StudioNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-zinc-800 bg-studio-panel px-4 py-3 lg:hidden">
        <p className="text-base font-bold text-studio-accent">FilmyAI Studio</p>
        <button
          type="button"
          className="min-h-11 rounded border border-zinc-700 px-3 text-sm text-studio-muted"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-b border-zinc-800 bg-studio-panel px-3 py-3 lg:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(isActive(link.href))}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <p className="mt-2 px-3 text-xs uppercase tracking-widest text-studio-muted">
            Staging · local shell
          </p>
        </nav>
      )}
      <aside className="hidden w-56 shrink-0 border-r border-zinc-800 bg-studio-panel px-4 py-6 lg:block">
        <p className="mb-6 text-lg font-bold text-studio-accent">FilmyAI Studio</p>
        <nav className="flex flex-col gap-1 text-sm">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(isActive(link.href))}>
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="mt-8 text-xs uppercase tracking-widest text-studio-muted">
          Staging only · no Drive uploads
        </p>
      </aside>
    </>
  );
}
