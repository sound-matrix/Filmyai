import type { Metadata } from 'next';
import { AdminRoleGate } from '../components/AdminRoleGate';
import { StudioNav } from '../components/StudioNav';
import { StudioProvider } from '../components/StudioProvider';
import { AdminAuthStubProvider } from '../lib/admin-auth-stub';
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
        <AdminAuthStubProvider>
          <AdminRoleGate>
            <StudioProvider>
              <div className="flex min-h-screen flex-col lg:flex-row">
                <StudioNav />
                <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
              </div>
            </StudioProvider>
          </AdminRoleGate>
        </AdminAuthStubProvider>
      </body>
    </html>
  );
}
