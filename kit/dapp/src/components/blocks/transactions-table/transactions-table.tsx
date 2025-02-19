import { AssetTableSkeleton } from '@/components/blocks/asset-table/asset-table-skeleton';
import { getQueryClient, queryKeys } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { TransactionsTableClient } from './transactions-table-client';
import { getTransactionsList } from './transactions-table-data';

interface TransactionsTableProps {
  from?: string;
}

/**
 * Server component that renders a table of assets with data fetching capabilities
 * @template Asset The type of asset data being displayed
 */
export async function TransactionsTable({ from }: TransactionsTableProps) {
  const queryClient = getQueryClient();

  const queryKey = queryKeys.pendingTransactions(from);

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => getTransactionsList(from),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AssetTableSkeleton columns={4} />}>
        <TransactionsTableClient queryKey={queryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
