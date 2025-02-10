'use client';

import { StatLabel, StatSubtext, StatValue } from '@/components/blocks/stat/stat';
import { Card, CardContent } from '@/components/ui/card';
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
  });

  return (
    <Card>
      <CardContent>
        <StatLabel>Users</StatLabel>
        <StatValue>{data.totalUsers.toLocaleString()}</StatValue>
        <StatSubtext>{data.usersInLast24Hours.toLocaleString()} in last 24 hours</StatSubtext>
      </CardContent>
    </Card>
  );
}
