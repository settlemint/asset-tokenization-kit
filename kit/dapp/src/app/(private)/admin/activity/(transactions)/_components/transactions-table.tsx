import { getTransactionsList } from '@/app/(private)/admin/activity/(transactions)/_components/transactions-table-data';
import { AssetTableSkeleton } from '@/components/blocks/asset-table/asset-table-skeleton';
import { getQueryClient, queryKeys } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { TransactionsTableClient } from './transactions-table-client';

/**
 * Server component that renders a table of assets with data fetching capabilities
 * @template Asset The type of asset data being displayed
 */
export async function TransactionsTable() {
  const queryClient = getQueryClient();

  const queryKey = queryKeys.pendingTransactions();

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => getTransactionsList(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AssetTableSkeleton columns={4} />}>
        <TransactionsTableClient queryKey={queryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
