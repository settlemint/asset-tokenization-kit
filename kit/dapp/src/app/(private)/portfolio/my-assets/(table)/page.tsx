import { MyAssetsTableClient } from '@/app/(private)/portfolio/my-assets/(table)/_components/table-client';
import { PageHeader } from '@/components/layout/page-header';
import { getAuthenticatedUser } from '@/lib/auth/auth';
import { getQueryClient, queryKeys } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import type { Address } from 'viem';
import { getMyAssets } from '../../_components/data';

export default async function MyAssetsPage() {
  const user = await getAuthenticatedUser();
  const queryKey = queryKeys.user.balances(user.wallet as Address);
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => getMyAssets({ active: true, wallet: user.wallet as Address }),
  });
  return (
    <>
      <PageHeader title="My Assets" />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense>
          <MyAssetsTableClient queryKey={queryKey} wallet={user.wallet as Address} />
        </Suspense>
      </HydrationBoundary>
    </>
  );
}
