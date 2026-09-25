import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FilmyAI Viewer',
  description: 'FilmyAI streaming viewer — staging scaffold',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-zinc-800 px-6 py-4">
          <nav className="mx-auto flex max-w-6xl items-center justify-between">
            <a href="/" className="text-xl font-bold tracking-tight text-filmy-accent">
              FilmyAI
            </a>
            <span className="text-xs uppercase tracking-widest text-filmy-muted">
              Viewer · Staging
            </span>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
