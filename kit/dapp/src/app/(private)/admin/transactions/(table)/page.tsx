import { columns } from '@/app/(private)/admin/stablecoins/(table)/_components/columns';
import { AssetTableSkeleton } from '@/components/blocks/asset-table/asset-table-skeleton';
import { getTransactionsList } from '@/components/blocks/events/table/data';
import { TransactionsTableClient } from '@/components/blocks/events/table/table.client';
import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Transactions',
  description: 'Inspect all transactions on the network.',
};

export default async function TransactionsPage() {
  const queryClient = getQueryClient();
  const queryKey = ['transactionslist'];

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => getTransactionsList(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="mb-6 font-bold text-3xl tracking-tight">Transactions</h2>
      </div>
      <Suspense fallback={<AssetTableSkeleton columns={columns.length} />}>
        <TransactionsTableClient queryKey={queryKey} />
      </Suspense>
    </HydrationBoundary>
  );
}
