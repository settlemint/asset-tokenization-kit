/**
 * Client-side component for displaying asset data in a table format.
 * Uses React Query for data fetching and caching.
 */

'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';

export type AssetTableClientProps<Asset> = {
  assetConfig: AssetDetailConfig;
  dataAction: () => Promise<Asset[]>;
  refetchInterval?: number;
  /** Map of icon components to be used in the table */
  icons?: Record<string, ComponentType<{ className?: string }> | LucideIcon>;
  /** Column definitions for the table */
  columns: ColumnDef<Asset>[];
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
}: AssetTableClientProps<Asset>) {
  const { data } = useSuspenseQuery<Asset[]>({
    queryKey: assetConfig.queryKey,
    queryFn: () => dataAction(),
    refetchInterval,
  });

  return <DataTable columns={columns} data={data} icons={icons ?? {}} name={assetConfig.name} />;
}
