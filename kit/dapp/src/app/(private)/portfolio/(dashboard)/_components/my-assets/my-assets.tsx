import { getAuthenticatedUser } from '@/lib/auth/auth';
import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, type QueryKey, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getMyAssets } from '../../../_components/my-assets/data';
import { MyAssetsClient } from './my-assets-client';

export async function MyAssets() {
  const queryClient = getQueryClient();
  const user = await getAuthenticatedUser();
  const queryKey: QueryKey = ['my-assets', user.wallet];

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: getMyAssets,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <MyAssetsClient queryKey={queryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
