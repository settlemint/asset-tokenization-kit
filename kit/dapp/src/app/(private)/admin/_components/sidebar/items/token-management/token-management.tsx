import { assetsSidebarQueryKey } from '@/lib/config/assets';
import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getSidebarAssets } from './data';
import { TokenManagementClient } from './token-management-client';

export async function TokenManagement() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: assetsSidebarQueryKey,
    queryFn: getSidebarAssets,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <TokenManagementClient queryKey={assetsSidebarQueryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
