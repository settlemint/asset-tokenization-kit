import { getMyAssets } from '@/app/(private)/portfolio/_components/my-assets/data';
import { getAuthenticatedUser } from '@/lib/auth/auth';
import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, type QueryKey, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { DistributionClient } from './distribution-client';

export async function Distribution() {
  const queryClient = getQueryClient();
  const user = await getAuthenticatedUser();
  const queryKey: QueryKey = ['my-assets-distribution', user.wallet];

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: getMyAssets,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <DistributionClient queryKey={queryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
