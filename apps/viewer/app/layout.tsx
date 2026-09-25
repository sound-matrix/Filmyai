import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { ViewerHeader } from '../components/ViewerHeader';
import { AuthStubProvider } from '../lib/auth-stub';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

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
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="font-sans">
        <AuthStubProvider>
          <ViewerHeader />
          <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
        </AuthStubProvider>
      </body>
    </html>
  );
}
