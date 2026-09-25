'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { AdminRoleGate } from './AdminRoleGate';
import { StudioNav } from './StudioNav';
import { StudioProvider } from './StudioProvider';

/**
 * CMS chrome + role gate for studio routes.
 * /sign-in renders without StudioNav so the login form stays clean.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isSignIn = pathname === '/sign-in';

  if (isSignIn) {
    return <>{children}</>;
  }

  return (
    <AdminRoleGate>
      <StudioProvider>
        <div className="flex min-h-screen flex-col lg:flex-row">
          <StudioNav />
          <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
        </div>
      </StudioProvider>
    </AdminRoleGate>
  );
}
