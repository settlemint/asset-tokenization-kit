import { TabNavigation } from '@/components/blocks/tab-navigation/tab-navigation';
import { PageHeader } from '@/components/layout/page-header';
import type { PropsWithChildren } from 'react';

const tabs = [
  {
    name: 'Recent transactions',
    href: '/admin/activity',
  },
  {
    name: 'All events',
    href: '/admin/activity/events',
  },
];

export default function ActivityLayout({ children }: PropsWithChildren) {
  return (
    <div>
      <PageHeader title={<span className="mr-2">Activity</span>} />
      <div className="relative mt-4 space-y-2">
        <TabNavigation items={tabs} />
      </div>
      {children}
    </div>
  );
}
