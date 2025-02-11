'use client';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { getRecentUsers } from './data';

interface UsersHistoryClientProps {
  queryKey: QueryKey;
}

export function UsersHistoryClient({ queryKey }: UsersHistoryClientProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: getRecentUsers,
    refetchInterval: 1000 * 5,
  });
  console.log(data);

  return <div>Users History</div>;
}
