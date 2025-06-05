'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PharmaFlowLogo } from '@/components/layout/PharmaFlowLogo';
import { NAV_ITEMS, type NavItem } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function SidebarNav() {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.href === '/') {
      return pathname === '/';
    }
    // Match based on the number of segments specified
    const pathSegments = pathname.split('/').filter(Boolean);
    const hrefSegments = item.href.split('/').filter(Boolean);
    if (item.matchSegments === undefined || item.matchSegments >= hrefSegments.length) {
       return pathname.startsWith(item.href);
    }
    return pathSegments.slice(0, item.matchSegments).join('/') === hrefSegments.slice(0, item.matchSegments).join('/');
  };


  return (
    <aside className="fixed inset-y-0 left-0 z-10 flex w-60 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-sidebar-border">
        <Link href="/" aria-label="PharmaFlow Home">
          <PharmaFlowLogo />
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-y-2 overflow-y-auto p-4">
        <TooltipProvider delayDuration={100}>
        <ul role="list" className="flex flex-1 flex-col gap-y-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium leading-6 transition-colors duration-150',
                      isActive(item)
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                    aria-current={isActive(item) ? 'page' : undefined}
                  >
                    <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" align="center" className="md:hidden">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            </li>
          ))}
        </ul>
        </TooltipProvider>
      </nav>
    </aside>
  );
}
