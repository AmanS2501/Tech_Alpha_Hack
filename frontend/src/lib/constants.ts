import {
  LayoutDashboard,
  PackagePlus,
  Boxes,
  Building,
  BrainCircuit,
  Shuffle,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  matchSegments?: number; // Number of path segments to match for active state
};

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, matchSegments: 0 },
  { href: '/production', label: 'Production', icon: PackagePlus, matchSegments: 1 },
  { href: '/inventory', label: 'Inventory', icon: Boxes, matchSegments: 1 },
  { href: '/pharmacy', label: 'Pharmacy', icon: Building, matchSegments: 1 },
  { href: '/forecasting', label: 'Forecasting', icon: BrainCircuit, matchSegments: 1 },
  { href: '/redirection', label: 'Redirection', icon: Shuffle, matchSegments: 1 },
];
