import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, type QueryKey, dehydrate } from '@tanstack/react-query';
import type { ComponentType } from 'react';
import { Suspense } from 'react';

interface QueryWrapperProps<TData> {
  queryKey: QueryKey;

  queryFn: () => Promise<TData>;

  ClientComponent: ComponentType<{ queryKey: QueryKey }>;
}

/**
 * A server component that handles query setup and hydration
 */
export async function QueryWrapper<TData>({ queryKey, queryFn, ClientComponent }: QueryWrapperProps<TData>) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <ClientComponent queryKey={queryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
