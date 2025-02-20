import type { AssetDetailConfig } from '@/lib/config/assets';
import { getQueryClient, queryKeys } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import type { Address } from 'viem';
import { AssetTableSkeleton } from '../asset-table/asset-table-skeleton';
import type { DataTablePaginationOptions } from '../data-table/data-table-pagination';
import type { DataTableToolbarOptions } from '../data-table/data-table-toolbar';
import { PermissionsTableClient } from './asset-permissions-table-client';
import { getPermissions } from './asset-permissions-table-data';

/**
 * Props for the AssetTable component
 * @template Asset The type of asset data being displayed
 */
export interface AssetHoldersTableProps {
  asset: Address;
  assetConfig: AssetDetailConfig;
  first?: number;
  toolbar?: DataTableToolbarOptions;
  pagination?: DataTablePaginationOptions;
}

/**
 * Server component that renders a table of asset permissions with data fetching capabilities
 * @template Asset The type of asset data being displayed
 */
export async function AssetPermissionsTable({
  asset,
  assetConfig,
  first,
  toolbar,
  pagination,
}: AssetHoldersTableProps) {
  const queryClient = getQueryClient();

  const queryKey = queryKeys.asset.permissions({ type: assetConfig.queryKey, address: asset });

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => getPermissions(asset),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AssetTableSkeleton columns={4} />}>
        <PermissionsTableClient
          queryKey={queryKey}
          first={first}
          toolbar={toolbar}
          pagination={pagination}
          asset={asset}
          assetConfig={assetConfig}
        />
      </Suspense>
    </HydrationBoundary>
  );
}
