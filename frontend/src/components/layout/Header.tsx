'use client';

import { Bell, UserCircle, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname, useRouter } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const currentNavItem = NAV_ITEMS.find(item => {
    if (item.href === '/') return pathname === '/';
    return pathname.startsWith(item.href);
  });
  const pageTitle = currentNavItem?.label || "PharmaFlow";
  
  // Mock user state - in a real app, this would come from your auth context
  const isLoggedIn = true; // For demonstration purposes
  const user = {
    name: 'John Doe',
    initials: 'JD',
    role: 'Pharmacist'
  };

  const handleLogout = () => {
    // Clear the authentication state
    localStorage.removeItem('isLoggedIn');
    // Or set it to false
    // localStorage.setItem('isLoggedIn', 'false');
    
    // Then redirect to auth page
    router.push('/auth');
  };

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
          
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full" aria-label="User menu">
                  <Avatar>
                    <AvatarFallback>{user.initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/auth">
                <UserCircle className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
