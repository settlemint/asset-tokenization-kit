import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getUserWidgetData } from './data';
import { UsersWidgetClient } from './users-client';

export async function UsersWidget() {
  const queryClient = getQueryClient();
  const queryKey = ['users'];

  await queryClient.prefetchQuery({
    queryKey: queryKey,
    queryFn: getUserWidgetData,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <UsersWidgetClient queryKey={queryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
