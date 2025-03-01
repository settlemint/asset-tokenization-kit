import type { NavElement } from '@/components/layout/nav-main';
import { ActivityIcon } from '@/components/ui/animated-icons/activity';
import { UsersIcon } from '@/components/ui/animated-icons/users';

export const bottomItems: NavElement[] = [
  {
    label: 'User management',
    icon: <UsersIcon className="size-4" />,
    path: '/admin/users',
  },
  {
    label: 'Activity',
    icon: <ActivityIcon className="size-4" />,
    path: '/admin/activity',
  },
  // {
  //   label: 'Settings',
  //   icon: <SettingsGearIcon className="size-4" />,
  //   path: '/admin/settings',
  // },
];
