import type { Metadata } from 'next';
import { StudioNav } from '../components/StudioNav';
import { StudioProvider } from '../components/StudioProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'FilmyAI Admin Studio',
  description: 'FilmyAI admin studio MVP shells — staging only',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StudioProvider>
          <div className="flex min-h-screen flex-col lg:flex-row">
            <StudioNav />
            <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
          </div>
        </StudioProvider>
      </body>
    </html>
  );
}
