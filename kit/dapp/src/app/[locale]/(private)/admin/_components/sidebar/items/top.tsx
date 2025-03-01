import type { NavElement } from '@/components/layout/nav-main';
import { ChartScatterIcon } from '@/components/ui/animated-icons/chart-scatter';

export const topItems: NavElement[] = [
  {
    label: 'Dashboard',
    icon: <ChartScatterIcon className="size-4" />,
    path: '/admin',
  },
  // {
  //   label: 'Actions',
  //   icon: <BellIcon className="size-4" />,
  //   path: '/admin/actions',
  //   badge: '12',
  // },
];
