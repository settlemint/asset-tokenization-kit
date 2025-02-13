import { columns } from '@/app/(private)/admin/stablecoins/(table)/_components/columns';
import { AssetTableSkeleton } from '@/components/blocks/asset-table/asset-table-skeleton';
import { getTransactionsList } from '@/components/blocks/events/table/data';
import { TransactionsTableClient } from '@/components/blocks/events/table/table.client';
import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import Link from 'next/link';
import { Suspense } from 'react';

export default async function LatestTransactions() {
  const queryClient = getQueryClient();
  const first = 5;
  const queryKey = ['first5TransactionsList'];

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => getTransactionsList(first),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AssetTableSkeleton columns={columns.length} />}>
        <TransactionsTableClient
          queryKey={queryKey}
          first={first}
          toolbar={{ enableToolbar: false }}
          pagination={{ enablePagination: false }}
        />
        <div className="mt-4">
          <Link href="/admin/transactions" className="text-muted-foreground text-sm hover:text-primary">
            View all transactions →
          </Link>
        </div>
      </Suspense>
    </HydrationBoundary>
  );
}
