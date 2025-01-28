import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { TRANSACTIONS_QUERY_KEY } from './consts';
import { getProcessedTransactions } from './data';
import { ProcessedTransactionsStatClient } from './stat-client';

export async function ProcessedTransactionsStat({ refetchInterval }: { refetchInterval?: number }) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [TRANSACTIONS_QUERY_KEY],
    queryFn: () => getProcessedTransactions(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <ProcessedTransactionsStatClient
          refetchInterval={refetchInterval}
          dataAction={getProcessedTransactions}
          queryKey={TRANSACTIONS_QUERY_KEY}
        />
      </Suspense>
    </HydrationBoundary>
  );
}
