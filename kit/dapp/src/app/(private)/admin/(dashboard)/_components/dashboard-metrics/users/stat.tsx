import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getUsersData } from './data';
import { UsersStatClient } from './stat-client';
export const USERS_QUERY_KEY = 'users';
export async function UsersStat({ refetchInterval }: { refetchInterval: number }) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [USERS_QUERY_KEY],
    queryFn: () => getUsersData(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <UsersStatClient refetchInterval={refetchInterval} dataAction={getUsersData} queryKey={USERS_QUERY_KEY} />
      </Suspense>
    </HydrationBoundary>
  );
}
