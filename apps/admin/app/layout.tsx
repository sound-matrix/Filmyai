import type { Metadata } from 'next';
import { AdminShell } from '../components/AdminShell';
import { AdminAuthProvider } from '../lib/admin-auth';
import './globals.css';

export const metadata: Metadata = {
  title: 'FilmyAI Admin Studio',
  description: 'FilmyAI admin studio — staging only',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AdminAuthProvider>
          <AdminShell>{children}</AdminShell>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
