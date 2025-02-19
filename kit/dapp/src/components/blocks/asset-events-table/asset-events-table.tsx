import type { AssetDetailConfig } from '@/lib/config/assets';
import { getQueryClient, queryKeys } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import type { Address } from 'viem';
import { AssetTableSkeleton } from '../asset-table/asset-table-skeleton';
import { AssetEventsTableClient } from './asset-events-table-client';
import { getEventsList } from './asset-events-table-data';

export type AssetEventsTableProps =
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
export async function AssetEventsTable({ asset, first, disableToolbarAndPagination }: AssetEventsTableProps) {
  const queryClient = getQueryClient();

  const queryKey = queryKeys.asset.events(asset);

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => getEventsList({ asset, first }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AssetTableSkeleton columns={4} />}>
        <AssetEventsTableClient
          queryKey={queryKey}
          first={first}
          asset={asset}
          disableToolbarAndPagination={disableToolbarAndPagination}
        />
      </Suspense>
    </HydrationBoundary>
  );
}
