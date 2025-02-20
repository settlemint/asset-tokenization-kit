import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, type QueryKey, dehydrate } from '@tanstack/react-query';
import { type PropsWithChildren, Suspense } from 'react';
import { getMyAssets } from './data';

interface MyAssetsTableProps extends PropsWithChildren {
  active?: boolean;
  queryKey: QueryKey;
}

export async function MyAssetsTable({ active, children, queryKey }: MyAssetsTableProps) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => getMyAssets(active),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>{children}</Suspense>
    </HydrationBoundary>
  );
}
