'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type AuthCheckProps = {
  children: React.ReactNode;
};

export function AuthCheck({ children }: AuthCheckProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // In a real app, you would check if the user is authenticated
    // For now, we'll simulate this with localStorage or a mock check
    const checkAuth = () => {
      // Mock authentication check - replace with your actual auth logic
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsAuthenticated(isLoggedIn);
      
      // If not authenticated and not at the root (which is now the auth page), redirect to root
      if (!isLoggedIn && pathname !== '/') {
        router.push('/');
      }
      
      // If on root page and authenticated, redirect to dashboard
      if (isLoggedIn && pathname === '/') {
        router.push('/dashboard');
      }
    };
    
    checkAuth();
  }, [router, pathname]);

  // Show nothing while checking authentication
  if (isAuthenticated === null) {
    return null;
  }

  // If authenticated or on auth page (root), render children
  return <>{children}</>;
}