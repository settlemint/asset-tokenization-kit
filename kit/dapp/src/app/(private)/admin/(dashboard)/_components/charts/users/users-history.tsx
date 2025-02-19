import { ChartSkeleton } from '@/components/blocks/charts/chart-skeleton';
import { getQueryClient, queryKeys } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getRecentUsers } from './data';
import { UsersHistoryClient } from './users-history-client';

export async function UsersHistory() {
  const queryClient = getQueryClient();
  const queryKey = queryKeys.dashboard.charts.usersHistory;

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: getRecentUsers,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ChartSkeleton title="Users" variant="loading" />}>
        <UsersHistoryClient queryKey={queryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
