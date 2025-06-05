'use client';

import { Bell, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';

export function Header() {
  const pathname = usePathname();
  const currentNavItem = NAV_ITEMS.find(item => {
    if (item.href === '/') return pathname === '/';
    return pathname.startsWith(item.href);
  });
  const pageTitle = currentNavItem?.label || "PharmaFlow";

  return (
    <header className="sticky top-0 z-5 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
           <h1 className="text-xl font-semibold text-foreground">{pageTitle}</h1>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-6 w-6" />
          </Button>
          <span className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" aria-hidden="true" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="User menu">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
