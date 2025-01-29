import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getDashboardMetrics } from './data';
import { DASHBOARD_STATS_QUERY_KEY, DashboardStatsClient } from './stat-client';

export async function DashboardStats() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [DASHBOARD_STATS_QUERY_KEY],
    queryFn: () => getDashboardMetrics(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <DashboardStatsClient />
      </Suspense>
    </HydrationBoundary>
  );
}
