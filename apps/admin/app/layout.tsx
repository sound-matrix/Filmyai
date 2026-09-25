import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'FilmyAI Admin Studio',
  description: 'FilmyAI admin studio — staging scaffold',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          <aside className="w-56 shrink-0 border-r border-zinc-800 bg-studio-panel px-4 py-6">
            <p className="mb-6 text-lg font-bold text-studio-accent">FilmyAI Studio</p>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href="/" className="rounded px-3 py-2 hover:bg-zinc-800">
                Dashboard
              </Link>
              <Link href="/films" className="rounded px-3 py-2 hover:bg-zinc-800">
                Films
              </Link>
              <Link href="/films/new" className="rounded px-3 py-2 hover:bg-zinc-800">
                New film
              </Link>
            </nav>
            <p className="mt-8 text-xs uppercase tracking-widest text-studio-muted">
              Staging only
            </p>
          </aside>
          <main className="flex-1 px-8 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
