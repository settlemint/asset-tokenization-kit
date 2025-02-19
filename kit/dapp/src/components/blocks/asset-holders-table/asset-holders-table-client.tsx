'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import type { DataTablePaginationOptions } from '@/components/blocks/data-table/data-table-pagination';
import type { DataTableToolbarOptions } from '@/components/blocks/data-table/data-table-toolbar';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { columns, icons } from './asset-holder-table-columns';
import type { Holder } from './asset-holders-table-data';
import { getHolders } from './asset-holders-table-data';

interface HoldersTableClientProps {
  queryKey: QueryKey;
  first?: number;
  toolbar?: DataTableToolbarOptions;
  pagination?: DataTablePaginationOptions;
  asset: Address;
  assetConfig: AssetDetailConfig;
}

export function HoldersTableClient({ queryKey, toolbar, pagination, asset, assetConfig }: HoldersTableClientProps) {
  const { data } = useSuspenseQuery<Holder[]>({
    queryKey,
    queryFn: () => getHolders(asset),
  });

  return (
    <DataTable
      columns={columns(asset as Address, assetConfig)}
      data={data}
      icons={icons}
      name={'Holders'}
      toolbar={toolbar}
      pagination={pagination}
    />
  );
}
