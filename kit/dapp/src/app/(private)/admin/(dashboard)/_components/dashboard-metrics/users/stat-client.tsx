'use client';
import { Stat, StatLabel, StatSubtext, StatValue } from '@/components/blocks/stat/stat';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { UsersData } from './data';

export function UsersStatClient({
  refetchInterval,
  dataAction,
  queryKey,
}: { refetchInterval?: number; dataAction: () => Promise<UsersData>; queryKey: string }) {
  const { data } = useSuspenseQuery({
    queryKey: [queryKey],
    queryFn: () => dataAction(),
    refetchInterval,
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
