import type { AssetDetailConfig } from '@/lib/config/assets';
import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { useReactTable } from '@tanstack/react-table';
import type { PropsWithChildren } from 'react';
import { Suspense } from 'react';
import { AssetTableError } from './asset-table-error';
import { AssetTableSkeleton } from './asset-table-skeleton';

/**
 * Props for the AssetTable component
 * @template Asset The type of asset data being displayed
 */
export interface AssetTableProps<Asset extends Record<string, unknown>, DataActionResponse = Asset[]> {
  assetConfig: Pick<AssetDetailConfig, 'queryKey' | 'name'>;
  /** Function to fetch the asset data */
  dataAction: () => Promise<DataActionResponse>;
  /** Column definitions for the table */
  columns: Parameters<typeof useReactTable<Asset>>[0]['columns'];
}

/**
 * Server component that renders a table of assets with data fetching capabilities
 * @template Asset The type of asset data being displayed
 */
export async function AssetTable<Asset extends Record<string, unknown>, DataActionResponse = Asset[]>({
  dataAction,
  assetConfig,
  columns,
  children,
}: PropsWithChildren<AssetTableProps<Asset, DataActionResponse>>) {
  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: assetConfig.queryKey,
      queryFn: () => dataAction(),
    });

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<AssetTableSkeleton columns={columns.length} />}>{children}</Suspense>
      </HydrationBoundary>
    );
  } catch (error) {
    return <AssetTableError error={error} />;
  }
}
