'use client';

import {
  type Pagination,
  ServerAssetTableClient,
  type Sorting,
} from '@/components/blocks/asset-table/server-asset-table-client';
import type { AssetDetailConfig } from '@/lib/config/assets';
import type { SortingState } from '@tanstack/react-table';
import { useCallback } from 'react';
import { getStablecoinBalances } from './data';
import { columns } from './holders-columns';

interface HoldersTableClientProps {
  id: string;
  assetConfig: Pick<AssetDetailConfig, 'queryKey' | 'name'>;
  initialSorting: SortingState;
}

export function HoldersTableClient({ id, assetConfig, initialSorting }: HoldersTableClientProps) {
  const getData = useCallback(
    async (pagination: Pagination, sorting: Sorting | undefined) => {
      const result = await getStablecoinBalances(id, pagination, sorting);
      return { assets: result.holders, rowCount: result.count };
    },
    [id]
  );

  return (
    <ServerAssetTableClient
      refetchInterval={5000}
      assetConfig={assetConfig}
      dataAction={getData}
      columns={columns}
      initialSorting={initialSorting}
    />
  );
}
