'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

type AuthCheckProps = {
  children: React.ReactNode;
};

export function AuthCheck({ children }: AuthCheckProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      // If not authenticated and not at the root (which is now the auth page), redirect to root
      if (!isAuthenticated && pathname !== '/') {
        router.push('/');
      }
      
      // If on root page and authenticated, redirect to dashboard
      if (isAuthenticated && pathname === '/') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Show nothing while checking authentication
  if (isLoading) {
    return null;
  }

  // If authenticated or on auth page (root), render children
  return <>{children}</>;
}