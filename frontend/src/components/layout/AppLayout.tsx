'use client';

import { ReactNode } from 'react';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { Header } from '@/components/layout/Header';
import { Toaster } from "@/components/ui/toaster";
import { usePathname } from 'next/navigation';

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/'; // Updated from '/auth' to '/'

  return (
    <div className="min-h-screen bg-background">
      {!isAuthPage && <SidebarNav />}
      <div className={!isAuthPage ? "pl-60" : ""}> {/* Adjust based on sidebar width */}
        {!isAuthPage && <Header />}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
