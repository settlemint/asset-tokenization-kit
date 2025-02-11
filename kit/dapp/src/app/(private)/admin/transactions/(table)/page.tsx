import { columns } from '@/app/(private)/admin/stablecoins/(table)/_components/columns';
import { TransactionsTableClient } from '@/app/(private)/admin/transactions/(table)/_components/table.client';
import { AssetTableSkeleton } from '@/components/blocks/asset-table/asset-table-skeleton';
import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTransactionsList } from './_components/data';

export const metadata: Metadata = {
  title: 'Transactions',
  description: 'Inspect all transactions on the network.',
};

export default async function TransactionsPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['transactionslist'],
    queryFn: getTransactionsList,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="mb-6 font-bold text-3xl tracking-tight">Transactions</h2>
      </div>
      <Suspense fallback={<AssetTableSkeleton columns={columns.length} />}>
        <TransactionsTableClient />
      </Suspense>
    </HydrationBoundary>
  );
}
