import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, type QueryKey, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { EventsBarChartClient } from './bar-chart-client';
import { EventsBarChartSkeleton } from './bar-chart-skeleton';
import { getAssetsEventsData } from './data';

export async function EventsBarChart() {
  const queryClient = getQueryClient();
  const queryKey: QueryKey = ['EventsBarChart'];
  await queryClient.prefetchQuery({
    queryKey,
    queryFn: getAssetsEventsData,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<EventsBarChartSkeleton />}>
        <EventsBarChartClient queryKey={queryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
