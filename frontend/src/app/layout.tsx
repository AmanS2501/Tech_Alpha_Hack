'use client';

import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { AuthCheck } from '@/components/layout/AuthCheck';
import { AppLayout } from '@/components/layout/AppLayout';
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AuthCheck>
            <AppLayout>{children}</AppLayout>
          </AuthCheck>
        </AuthProvider>
      </body>
    </html>
  );
}
