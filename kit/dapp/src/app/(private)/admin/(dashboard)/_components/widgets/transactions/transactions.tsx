import { getQueryClient, queryKeys } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getTransactionsWidgetData } from './data';
import { TransactionsWidgetClient } from './transactions-client';

export async function TransactionsWidget() {
  const queryClient = getQueryClient();
  const queryKey = queryKeys.dashboard.widget('transaction');

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: getTransactionsWidgetData,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <TransactionsWidgetClient queryKey={queryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
