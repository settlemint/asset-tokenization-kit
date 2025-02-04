'use client';

import { Stat, StatLabel, StatSubtext, StatValue } from '@/components/blocks/stat/stat';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getUserWidgetData } from './data';

interface DashboardWidgetClientProps {
  queryKey: string[];
}

export function UsersWidgetClient({ queryKey }: DashboardWidgetClientProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: getUserWidgetData,
    refetchInterval: 1000 * 10,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    networkMode: 'online',
  });

  return (
    <Stat>
      <StatLabel>Users</StatLabel>
      <StatValue>{data.totalUsers.toLocaleString()}</StatValue>
      <StatSubtext>{data.usersInLast24Hours.toLocaleString()} in last 24 hours</StatSubtext>
    </Stat>
  );
}
