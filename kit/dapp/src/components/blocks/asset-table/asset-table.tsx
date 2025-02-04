import type { AssetDetailConfig } from '@/lib/config/assets';
import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { useReactTable } from '@tanstack/react-table';
import type { ComponentType } from 'react';
import { Suspense } from 'react';
import { AssetTableClient } from './asset-table-client';
import { AssetTableError } from './asset-table-error';
import { AssetTableSkeleton } from './asset-table-skeleton';

/**
 * Props for the AssetTable component
 * @template Asset The type of asset data being displayed
 */
export interface AssetTableProps<Asset extends Record<string, unknown>> {
  assetConfig: AssetDetailConfig;
  /** Function to fetch the asset data */
  dataAction: () => Promise<Asset[]>;
  /** Optional interval for refetching data in milliseconds */
  refetchInterval?: number;
  /** Optional map of icon components */
  icons?: Record<string, ComponentType<{ className?: string }>>;
  /** Column definitions for the table */
  columns: Parameters<typeof useReactTable<Asset>>[0]['columns'];
}

/**
 * Server component that renders a table of assets with data fetching capabilities
 * @template Asset The type of asset data being displayed
 */
export async function AssetTable<Asset extends Record<string, unknown>>({
  dataAction,
  assetConfig,
  refetchInterval,
  icons,
  columns,
}: AssetTableProps<Asset>) {
  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: assetConfig.queryKey,
      queryFn: () => dataAction(),
    });

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<AssetTableSkeleton columns={columns.length} />}>
          <AssetTableClient<Asset>
            refetchInterval={refetchInterval}
            assetConfig={assetConfig}
            dataAction={dataAction}
            icons={icons}
            columns={columns}
          />
        </Suspense>
      </HydrationBoundary>
    );
  } catch (error) {
    return <AssetTableError error={error} />;
  }
}
