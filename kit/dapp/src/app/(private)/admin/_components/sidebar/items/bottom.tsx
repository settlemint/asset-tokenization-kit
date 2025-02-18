import type { NavElement } from '@/components/layout/nav-main';
import { ActivityIcon } from '@/components/ui/animated-icons/activity';
import { SettingsGearIcon } from '@/components/ui/animated-icons/settings-gear';
import { UsersIcon } from '@/components/ui/animated-icons/users';

export const bottomItems: NavElement[] = [
  {
    label: 'User management',
    icon: <UsersIcon className="h-4 w-4" />,
    path: '/admin/users',
  },
  {
    label: 'Transactions',
    icon: <ActivityIcon className="h-4 w-4" />,
    path: '/admin/transactions',
  },
  {
    label: 'Settings',
    icon: <SettingsGearIcon className="h-4 w-4" />,
    path: '/admin/settings',
  },
];
