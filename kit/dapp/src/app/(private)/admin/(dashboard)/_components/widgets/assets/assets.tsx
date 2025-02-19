import { getQueryClient, queryKeys } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getAssetsWidgetData } from '../../common/assets/data';
import { AssetsWidgetClient } from './assets-client';

export async function AssetsWidget() {
  const queryClient = getQueryClient();
  const queryKey = queryKeys.dashboard.widget('asset');

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: getAssetsWidgetData,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <AssetsWidgetClient queryKey={queryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
