import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { DASHBOARD_CHART_QUERY_KEY } from '../consts';
import { DashboardChartsClient } from './chart-client';
import { getDashboardCharts } from './data';

export async function DashboardCharts() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [DASHBOARD_CHART_QUERY_KEY],
    queryFn: () => getDashboardCharts(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <DashboardChartsClient />
      </Suspense>
    </HydrationBoundary>
  );
}
