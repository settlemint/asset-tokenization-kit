import { columns } from '@/app/(private)/admin/stablecoins/(table)/_components/columns';
import { AssetTableSkeleton } from '@/components/blocks/asset-table/asset-table-skeleton';
import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getHolders } from './_components/data';
import { HoldersTableClient } from './_components/holders-table-client';

export const metadata: Metadata = {
  title: 'Holders',
  description: 'Inspect all holders of the stablecoin.',
};

export default async function StablecoinHoldersPage({ params }: { params: Promise<{ id: string }> }) {
  const queryClient = getQueryClient();
  const { id } = await params;
  const queryKey = ['stablecoin-holders', id];

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => getHolders(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AssetTableSkeleton columns={columns.length} />}>
        <HoldersTableClient queryKey={queryKey} asset={id} />
      </Suspense>
    </HydrationBoundary>
  );
}
