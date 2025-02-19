import { getQueryClient, queryKeys } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { type PropsWithChildren, Suspense } from 'react';
import type { Address } from 'viem';
import { AssetTableSkeleton } from '../asset-table/asset-table-skeleton';
import { getHolders } from './asset-holders-table-data';

/**
 * Props for the AssetTable component
 * @template Asset The type of asset data being displayed
 */
export interface AssetHoldersTableProps {
  asset: Address;
}

/**
 * Server component that renders a table of assets with data fetching capabilities
 * @template Asset The type of asset data being displayed
 */
export async function AssetHoldersTable({ asset, children }: PropsWithChildren<AssetHoldersTableProps>) {
  const queryClient = getQueryClient();

  const queryKey = queryKeys.asset.stats({ address: asset, type: 'holders' });

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => getHolders(asset),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AssetTableSkeleton columns={4} />}>{children}</Suspense>
    </HydrationBoundary>
  );
}
