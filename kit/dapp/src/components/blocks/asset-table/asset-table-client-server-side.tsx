/**
 * Client-side component for displaying asset data in a table format.
 * Uses React Query for data fetching and caching.
 */

'use client';

import { DataTableServerSide } from '@/components/blocks/data-table/data-table-server-side';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { useReactTable } from '@tanstack/react-table';
import type { LucideIcon } from 'lucide-react';
import { type ComponentType, useCallback, useState } from 'react';

export type AssetTableClientServerSideProps<Asset> = {
  assetConfig: Pick<AssetDetailConfig, 'queryKey' | 'name'>;
  dataAction: (pagination: { first: number; skip: number }) => Promise<Asset[]>;
  refetchInterval?: number;
  /** Map of icon components to be used in the table */
  icons?: Record<string, ComponentType<{ className?: string }> | LucideIcon>;
  /** Column definitions for the table */
  columns: Parameters<typeof useReactTable<Asset>>[0]['columns'];
  /** The number of items to display per page */
  pageSize?: number;
  /** The total number of items in the table */
  rowCount: number;
};

/**
 * Client-side table component for displaying asset data
 * @template Asset - The type of asset data being displayed
 */
export function AssetTableClientServerSide<Asset extends Record<string, unknown>>({
  dataAction,
  assetConfig,
  refetchInterval,
  columns,
  icons,
  pageSize = 10,
  rowCount,
}: AssetTableClientServerSideProps<Asset>) {
  const [pagination, setPagination] = useState({
    first: pageSize,
    skip: 0,
  });

  const { data } = useSuspenseQuery<Asset[]>({
    queryKey: assetConfig.queryKey,
    queryFn: () => dataAction(pagination),
    refetchInterval,
  });

  const handlePageChanged = useCallback(
    (pageIndex: number) => {
      setPagination((current) => ({ first: current.first, skip: pageIndex * pageSize }));
    },
    [pageSize]
  );

  return (
    <DataTableServerSide
      columns={columns}
      data={data}
      icons={icons ?? {}}
      name={assetConfig.name}
      onPageChanged={handlePageChanged}
      rowCount={rowCount}
    />
  );
}
