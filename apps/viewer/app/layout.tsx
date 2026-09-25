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
        <header className="sticky top-0 z-40 border-b border-zinc-800 bg-filmy-bg/95 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
            <a href="/" className="text-lg font-bold tracking-tight text-filmy-accent sm:text-xl">
              FilmyAI
            </a>
            <span className="text-[10px] uppercase tracking-widest text-filmy-muted sm:text-xs">
              Viewer · Staging
            </span>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </body>
    </html>
  );
}
