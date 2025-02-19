/**
 * Client-side component for displaying asset data in a table format.
 * Uses React Query for data fetching and caching.
 */

'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import type { AssetDetailConfig } from '@/lib/config/assets';
import type { QueryKey } from '@tanstack/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { useReactTable } from '@tanstack/react-table';
import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';

export type AssetTableClientProps<Asset> = {
  assetConfig: AssetDetailConfig;
  dataAction: () => Promise<Asset[]>;
  refetchInterval?: number;
  /** Map of icon components to be used in the table */
  icons?: Record<string, ComponentType<{ className?: string }> | LucideIcon>;
  /** Column definitions for the table */
  columns: Parameters<typeof useReactTable<Asset>>[0]['columns'];
  queryKey: QueryKey;
};

/**
 * Client-side table component for displaying asset data
 * @template Asset - The type of asset data being displayed
 */
export function AssetTableClient<Asset extends Record<string, unknown>>({
  dataAction,
  assetConfig,
  refetchInterval,
  columns,
  icons,
  queryKey,
}: AssetTableClientProps<Asset>) {
  const { data } = useSuspenseQuery<Asset[]>({
    queryKey,
    queryFn: () => dataAction(),
    refetchInterval,
  });

  return <DataTable columns={columns} data={data} icons={icons ?? {}} name={assetConfig.name} />;
}
