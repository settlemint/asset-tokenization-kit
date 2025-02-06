import type { NavElement, NavItem } from '@/components/layout/nav-main';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { assetConfig } from '@/lib/config/assets';
import { AlertTriangle, ArrowRightLeft, LayoutDashboard, Settings, Users } from 'lucide-react';

export const topItems: NavElement[] = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard />,
    path: '/admin',
  },
  {
    label: 'Actions',
    icon: <AlertTriangle />,
    path: '/admin/actions',
    badge: '12',
  },
];

export const bottomItems: NavElement[] = [
  {
    label: 'User management',
    icon: <Users />,
    path: '/admin/users',
  },
  {
    label: 'Transactions',
    icon: <ArrowRightLeft />,
    path: '/admin/transactions',
  },
  {
    label: 'Settings',
    icon: <Settings />,
    path: '/admin/settings',
  },
];

export const tokenItems: NavItem[] = [
  {
    assetType: 'cryptocurrency',
    label: assetConfig.cryptocurrency.pluralName,
    path: `/admin/${assetConfig.cryptocurrency.urlSegment}`,
    icon: (
      <Avatar className="h-4 w-4 border border-foreground-muted">
        <AvatarFallback className="text-[7px]">CC</AvatarFallback>
      </Avatar>
    ),
  },
  {
    assetType: 'stablecoin',
    label: assetConfig.stablecoin.pluralName,
    path: `/admin/${assetConfig.stablecoin.urlSegment}`,
    icon: (
      <Avatar className="h-4 w-4 border border-foreground-muted">
        <AvatarFallback className="text-[7px]">SC</AvatarFallback>
      </Avatar>
    ),
  },
  {
    assetType: 'equity',
    label: assetConfig.equity.pluralName,
    path: `/admin/${assetConfig.equity.urlSegment}`,
    icon: (
      <Avatar className="h-4 w-4 border border-foreground-muted">
        <AvatarFallback className="text-[7px]">EQ</AvatarFallback>
      </Avatar>
    ),
  },
  {
    assetType: 'bond',
    label: assetConfig.bond.pluralName,
    path: `/admin/${assetConfig.bond.urlSegment}`,
    icon: (
      <Avatar className="h-4 w-4 border border-foreground-muted">
        <AvatarFallback className="text-[7px]">BN</AvatarFallback>
      </Avatar>
    ),
  },
  {
    assetType: 'fund',
    label: assetConfig.fund.pluralName,
    path: `/admin/${assetConfig.fund.urlSegment}`,
    icon: (
      <Avatar className="h-4 w-4 border border-foreground-muted">
        <AvatarFallback className="text-[7px]">FN</AvatarFallback>
      </Avatar>
    ),
  },
];
