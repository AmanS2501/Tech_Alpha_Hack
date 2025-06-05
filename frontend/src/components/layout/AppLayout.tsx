import type { ReactNode } from 'react';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { Header } from '@/components/layout/Header';
import { Toaster } from "@/components/ui/toaster";


type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <div className="pl-60"> {/* Adjust based on sidebar width */}
        <Header />
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
