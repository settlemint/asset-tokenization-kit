import type { AssetDetailConfig } from '@/lib/config/assets';
import { allAssetQueryKeys } from '@/lib/config/assets';
import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import type { Address } from 'viem';
import { AssetTableError } from '../asset-table/asset-table-error';
import { AssetTableSkeleton } from '../asset-table/asset-table-skeleton';
import { AssetEventsTableClient } from './asset-events-table-client';
import { getEventsList } from './asset-events-table-data';

/**
 * Props for the AssetTable component
 * @template Asset The type of asset data being displayed
 */
export type AssetsEventsTableProps =
  | {
      asset: Address;
      assetConfig: AssetDetailConfig;
      first?: number;
      disableToolbarAndPagination?: boolean;
    }
  | {
      asset?: undefined;
      assetConfig?: undefined;
      first?: number;
      disableToolbarAndPagination?: boolean;
    };

/**
 * Server component that renders a table of assets with data fetching capabilities
 * @template Asset The type of asset data being displayed
 */
export async function AssetsEventsTable({
  asset,
  assetConfig,
  first,
  disableToolbarAndPagination,
}: AssetsEventsTableProps) {
  const queryClient = getQueryClient();
  const queryKey = asset ? [...assetConfig.queryKey, { asset, first }] : allAssetQueryKeys;
  try {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn: () => getEventsList({ first, asset }),
    });

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<AssetTableSkeleton columns={4} />}>
          <AssetEventsTableClient
            queryKey={queryKey}
            asset={asset}
            first={first}
            disableToolbarAndPagination={disableToolbarAndPagination}
          />
        </Suspense>
      </HydrationBoundary>
    );
  } catch (error) {
    return <AssetTableError error={error} />;
  }
}
