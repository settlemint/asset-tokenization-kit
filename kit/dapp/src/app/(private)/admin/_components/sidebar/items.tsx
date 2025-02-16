import type { NavElement, NavItem } from '@/components/layout/nav-main';
import { ActivityIcon } from '@/components/ui/animated-icons/activity';
import { BellIcon } from '@/components/ui/animated-icons/bell';
import { ChartScatterIcon } from '@/components/ui/animated-icons/chart-scatter';
import { SettingsGearIcon } from '@/components/ui/animated-icons/settings-gear';
import { UsersIcon } from '@/components/ui/animated-icons/users';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { assetConfig } from '@/lib/config/assets';

export const topItems: NavElement[] = [
  {
    label: 'Dashboard',
    icon: <ChartScatterIcon />,
    path: '/admin',
  },
  {
    label: 'Actions',
    icon: <BellIcon />,
    path: '/admin/actions',
    badge: '12',
  },
];

export const bottomItems: NavElement[] = [
  {
    label: 'User management',
    icon: <UsersIcon />,
    path: '/admin/users',
  },
  {
    label: 'Transactions',
    icon: <ActivityIcon />,
    path: '/admin/transactions',
  },
  {
    label: 'Settings',
    icon: <SettingsGearIcon />,
    path: '/admin/settings',
  },
];

export const tokenItems: NavItem[] = [
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
    assetType: 'fund',
    label: assetConfig.fund.pluralName,
    path: `/admin/${assetConfig.fund.urlSegment}`,
    icon: (
      <Avatar className="h-4 w-4 border border-foreground-muted">
        <AvatarFallback className="text-[7px]">FN</AvatarFallback>
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
];
