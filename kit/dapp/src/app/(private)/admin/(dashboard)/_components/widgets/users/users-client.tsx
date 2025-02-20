'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { QueryKey } from '@tanstack/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { StatLabel } from '../stat/stat-label';
import { StatSubtext } from '../stat/stat-subtext';
import { StatValue } from '../stat/stat-value';
import { getUserWidgetData } from './data';

interface UsersWidgetClientProps {
  queryKey: QueryKey;
}

export function UsersWidgetClient({ queryKey }: UsersWidgetClientProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: getUserWidgetData,
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
