import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, type QueryClient, dehydrate } from '@tanstack/react-query';
import { type PropsWithChildren, type ReactNode, Suspense } from 'react';

export type PrefetchProps = {
  fallback?: ReactNode;
  queries?: Parameters<QueryClient['prefetchQuery']>[0][];
};

export async function Prefetch({ fallback, children, queries }: PropsWithChildren<PrefetchProps>) {
  const queryClient = getQueryClient();

  if (queries) {
    await Promise.all(queries.map((query) => queryClient.prefetchQuery(query)));
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </HydrationBoundary>
  );
}
