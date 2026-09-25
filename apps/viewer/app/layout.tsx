import type { Metadata } from 'next';
import { ViewerHeader } from '../components/ViewerHeader';
import { AuthStubProvider } from '../lib/auth-stub';
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
        <AuthStubProvider>
          <ViewerHeader />
          <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
        </AuthStubProvider>
      </body>
    </html>
  );
}
