/**
 * Client-side component for displaying asset data in a table format.
 * Uses React Query for data fetching and caching.
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { PaginationState, SortingState, useReactTable } from '@tanstack/react-table';
import type { LucideIcon } from 'lucide-react';
import { type ComponentType, useCallback, useEffect, useRef, useState } from 'react';
import { ServerDataTable } from '../data-table/server-data-table';

interface DataActionResponse<Asset> {
  assets: Asset[];
  rowCount: number;
}

export interface Pagination {
  first?: number;
  skip?: number;
}

export type Sorting = {
  orderBy: string; // Column ID
  orderDirection: 'asc' | 'desc';
};

export type ServerAssetTableClientProps<Asset extends Record<string, unknown>> = {
  assetConfig: Pick<AssetDetailConfig, 'queryKey' | 'name'>;
  dataAction: (pagination: Pagination, sorting: Sorting | undefined) => Promise<DataActionResponse<Asset>>;
  refetchInterval?: number;
  /** Map of icon components to be used in the table */
  icons?: Record<string, ComponentType<{ className?: string }> | LucideIcon>;
  /** Column definitions for the table */
  columns: Parameters<typeof useReactTable<Asset>>[0]['columns'];
  /** Initial sorting state for the table */
  initialSorting?: SortingState;
};

const INITIAL_PAGINATION: PaginationState = {
  pageIndex: 0,
  pageSize: 10,
};

/**
 * Client-side table component for displaying asset data
 * @template Asset - The type of asset data being displayed
 */
export function ServerAssetTableClient<Asset extends Record<string, unknown>>({
  dataAction,
  assetConfig,
  refetchInterval,
  columns,
  icons,
  initialSorting,
}: ServerAssetTableClientProps<Asset>) {
  const [pagination, setPagination] = useState<PaginationState>(INITIAL_PAGINATION);
  const [sorting, setSorting] = useState<SortingState>(initialSorting ?? []);
  const didMount = useRef(false);

  const { data, refetch, error, isFetching, isRefetching } = useSuspenseQuery<DataActionResponse<Asset>>({
    queryKey: assetConfig.queryKey,
    queryFn: () => {
      return dataAction(
        {
          first: pagination.pageSize,
          skip: pagination.pageIndex * pagination.pageSize,
        },
        sorting[0]
          ? {
              orderBy: sorting[0].id,
              orderDirection: sorting[0].desc ? 'desc' : 'asc',
            }
          : undefined
      );
    },
    refetchInterval,
  });

  const handleSortingChanged = useCallback((sortingState: SortingState) => {
    setSorting(sortingState);
    // Reset to page 1
    setPagination((current) => ({
      pageIndex: 0,
      pageSize: current.pageSize,
    }));
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: required for refetch
  useEffect(() => {
    // Return early, if this is the first render:
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    refetch();
  }, [pagination, sorting, refetch]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <ServerDataTable<Asset>
      isLoading={isFetching && !isRefetching}
      columns={columns}
      data={data.assets}
      icons={icons ?? {}}
      name={assetConfig.name}
      pagination={pagination}
      filters={[]}
      sorting={sorting}
      onPageChanged={setPagination}
      onFiltersChanged={() => {}}
      onSortingChanged={handleSortingChanged}
      rowCount={data.rowCount}
    />
  );
}
