import type { AssetDetailConfig } from '@/lib/config/assets';
import { getQueryClient, queryKeys } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { useReactTable } from '@tanstack/react-table';
import type { LucideIcon } from 'lucide-react';
import { type ComponentType, type PropsWithChildren, Suspense } from 'react';
import { AssetTableSkeleton } from './asset-table-skeleton';

type AssetUrlSegment = 'bonds' | 'equities' | 'funds' | 'stablecoins' | 'cryptocurrencies';

/**
 * Props for the AssetTable component
 * @template Asset The type of asset data being displayed
 */
export interface AssetTableProps<Asset extends Record<string, unknown>> {
  /** Function to fetch the asset data */
  dataAction: () => Promise<Asset[]>;
  /** Asset configuration for the table */
  assetConfig: AssetDetailConfig & { urlSegment: AssetUrlSegment };
  /** Optional refetch interval in milliseconds */
  refetchInterval?: number;
  /** Column definitions for the table */
  columns: Parameters<typeof useReactTable<Asset>>[0]['columns'];
  /** Icons for the table */
  icons?: Record<string, ComponentType<{ className?: string }> | LucideIcon>;
}

/**
 * Server component for displaying asset data in a table
 * @template Asset The type of asset data being displayed
 */
export async function AssetTable<Asset extends Record<string, unknown>>({
  dataAction,
  assetConfig,
  columns,
  children,
}: PropsWithChildren<AssetTableProps<Asset>>) {
  const queryClient = getQueryClient();
  const queryKey = queryKeys.assets.all(assetConfig.urlSegment);

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: dataAction,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AssetTableSkeleton columns={columns.length} />}>{children}</Suspense>
    </HydrationBoundary>
  );
}
