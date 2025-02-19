'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import type { DataTablePaginationOptions } from '@/components/blocks/data-table/data-table-pagination';
import type { DataTableToolbarOptions } from '@/components/blocks/data-table/data-table-toolbar';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { columns } from './asset-permissions-table-columns';
import type { Permission } from './asset-permissions-table-data';
import { getPermissions } from './asset-permissions-table-data';

interface PermissionsTableClientProps {
  queryKey: QueryKey;
  first?: number;
  toolbar?: DataTableToolbarOptions;
  pagination?: DataTablePaginationOptions;
  asset: Address;
  assetConfig: AssetDetailConfig;
}

export function PermissionsTableClient({
  queryKey,
  toolbar,
  pagination,
  asset,
  assetConfig,
}: PermissionsTableClientProps) {
  const { data } = useSuspenseQuery<Permission[]>({
    queryKey,
    queryFn: () => getPermissions(asset),
    refetchInterval: 5000,
  });

  console.log(data);

  return (
    <DataTable
      columns={columns(asset, assetConfig)}
      data={data}
      name={'Permissions'}
      toolbar={toolbar}
      pagination={pagination}
    />
  );
}
