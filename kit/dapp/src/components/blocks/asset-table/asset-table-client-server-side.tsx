/**
 * Client-side component for displaying asset data in a table format.
 * Uses React Query for data fetching and caching.
 */

'use client';

import { DataTableServerSide } from '@/components/blocks/data-table/data-table-server-side';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { PaginationState, useReactTable } from '@tanstack/react-table';
import type { LucideIcon } from 'lucide-react';
import { type ComponentType, useCallback, useEffect, useState } from 'react';

interface DataActionResponse<Asset> {
  assets: Asset[];
  rowCount: number;
}

export type AssetTableClientServerSideProps<Asset> = {
  assetConfig: Pick<AssetDetailConfig, 'queryKey' | 'name'>;
  dataAction: (pagination: { first: number; skip: number }) => Promise<DataActionResponse<Asset> | Asset[]>;
  refetchInterval?: number;
  /** Map of icon components to be used in the table */
  icons?: Record<string, ComponentType<{ className?: string }> | LucideIcon>;
  /** Column definitions for the table */
  columns: Parameters<typeof useReactTable<Asset>>[0]['columns'];
  /** The number of items to display per page */
  pageSize?: number;
};

const INITIAL_PAGINATION = {
  first: 10,
  skip: 0,
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
}: AssetTableClientServerSideProps<Asset>) {
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);

  const { data, refetch } = useSuspenseQuery<DataActionResponse<Asset> | Asset[]>({
    queryKey: assetConfig.queryKey,
    queryFn: () => dataAction(pagination),
    refetchInterval,
  });

  const handlePageChanged = useCallback(
    (updatedPagination: PaginationState) => {
      const skip = updatedPagination.pageIndex * updatedPagination.pageSize;
      if (pagination.skip !== skip || pagination.first !== updatedPagination.pageSize) {
        setPagination({
          first: updatedPagination.pageSize,
          skip: updatedPagination.pageIndex * updatedPagination.pageSize,
        });
      }
    },
    [pagination]
  );

  useEffect(() => {
    // Skip refetch on initial mount
    if (pagination === INITIAL_PAGINATION) {
      return;
    }
    refetch();
  }, [pagination, refetch]);

  return (
    <DataTableServerSide
      columns={columns}
      data={Array.isArray(data) ? data : data.assets}
      icons={icons ?? {}}
      name={assetConfig.name}
      onPageChanged={handlePageChanged}
      pageSize={pageSize}
      rowCount={Array.isArray(data) ? data.length : data.rowCount}
    />
  );
}
