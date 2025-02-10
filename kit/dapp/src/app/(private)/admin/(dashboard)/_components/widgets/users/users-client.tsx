'use client';

import { StatLabel, StatSubtext, StatValue } from '@/app/(private)/admin/(dashboard)/_components/widgets/blocks/stat';
import { Card, CardContent } from '@/components/ui/card';
import type { QueryKey } from '@tanstack/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getUserWidgetData } from './data';

interface UsersWidgetClientProps {
  queryKey: QueryKey;
}

export function UsersWidgetClient({ queryKey }: UsersWidgetClientProps) {
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
