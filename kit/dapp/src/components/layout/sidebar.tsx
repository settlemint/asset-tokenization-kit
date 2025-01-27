'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  AlertTriangle,
  ArrowRightLeft,
  Bitcoin,
  Coins,
  LayoutDashboard,
  Settings,
  TicketCheck,
  Users,
  Wallet,
} from 'lucide-react';
import type { ComponentProps } from 'react';
import { NavFooter } from './nav-footer';
import { NavHeader } from './nav-header';
import { type NavElement, NavMain } from './nav-main';
import { TokenDesignerButton } from './token-designer-button';

const defaultNavItems: NavElement[] = [
  {
    type: 'Item',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    type: 'Item',
    label: 'Actions',
    icon: AlertTriangle,
    path: '/actions',
    badge: 12,
  },
  {
    type: 'Group',
    groupTitle: 'Token management',
    items: [
      {
        type: 'Item',
        label: 'Stable coins',
        icon: Coins,
        path: '/tokens/stable',
        subItems: [
          { label: 'USDC', path: '/tokens/stable/usdc' },
          { label: 'EURC', path: '/tokens/stable/eurc' },
          { label: 'More...', path: '/tokens/stable' },
        ],
      },
      {
        type: 'Item',
        label: 'Equity',
        icon: Wallet,
        path: '/tokens/equity',
      },
      {
        type: 'Item',
        label: 'Bonds',
        icon: TicketCheck,
        path: '/tokens/bonds',
      },
      {
        type: 'Item',
        label: 'Cryptocurrencies',
        icon: Bitcoin,
        path: '/tokens/cryptocurrencies',
      },
    ],
  },
  {
    type: 'Item',
    label: 'User management',
    icon: Users,
    path: '/users',
  },
  {
    type: 'Item',
    label: 'Transactions',
    icon: ArrowRightLeft,
    path: '/transactions',
  },
  {
    type: 'Item',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
  },
];

export function PrivateSidebar({
  items = defaultNavItems,
  ...props
}: ComponentProps<typeof Sidebar> & {
  role?: 'admin' | 'issuer' | 'user';
  mode?: 'admin' | 'portfolio';
  items?: NavElement[];
}) {
  const role = props.role ?? 'user';
  const mode = props.mode ?? 'portfolio';

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavHeader />
      </SidebarHeader>
      <SidebarContent className="pt-4">
        {mode === 'admin' && <TokenDesignerButton />}
        <NavMain items={items} />
      </SidebarContent>
      {['admin', 'issuer'].includes(role) && (
        <>
          <SidebarSeparator />
          <SidebarFooter>
            <NavFooter mode={mode} />
          </SidebarFooter>
        </>
      )}
      <SidebarRail />
    </Sidebar>
  );
}
