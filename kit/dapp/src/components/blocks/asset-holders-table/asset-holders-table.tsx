import type { AssetDetailConfig } from '@/lib/config/assets';
import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import type { Address } from 'viem';
import { AssetTableError } from '../asset-table/asset-table-error';
import { AssetTableSkeleton } from '../asset-table/asset-table-skeleton';
import { HoldersTableClient } from './asset-holders-table-client';
import { getHolders } from './asset-holders-table-data';

/**
 * Props for the AssetTable component
 * @template Asset The type of asset data being displayed
 */
export interface AssetHoldersTableProps {
  asset: Address;
  assetConfig: AssetDetailConfig;
}

/**
 * Server component that renders a table of assets with data fetching capabilities
 * @template Asset The type of asset data being displayed
 */
export async function AssetHoldersTable({ asset, assetConfig }: AssetHoldersTableProps) {
  const queryClient = getQueryClient();
  const queryKey = [...assetConfig.queryKey, asset];
  try {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn: () => getHolders(asset),
    });

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<AssetTableSkeleton columns={4} />}>
          <HoldersTableClient queryKey={queryKey} asset={asset} assetConfig={assetConfig} />
        </Suspense>
      </HydrationBoundary>
    );
  } catch (error) {
    return <AssetTableError error={error} />;
  }
}
