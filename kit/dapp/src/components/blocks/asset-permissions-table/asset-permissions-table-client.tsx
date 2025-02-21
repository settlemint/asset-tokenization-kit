'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import type { DataTablePaginationOptions } from '@/components/blocks/data-table/data-table-pagination';
import type { DataTableToolbarOptions } from '@/components/blocks/data-table/data-table-toolbar';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import type { useReactTable } from '@tanstack/react-table';
import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';
import type { Address } from 'viem';
import type { PermissionWithRoles } from './asset-permissions-table-data';
import { getPermissions } from './asset-permissions-table-data';

interface PermissionsTableClientProps {
  queryKey: QueryKey;
  first?: number;
  toolbar?: DataTableToolbarOptions;
  pagination?: DataTablePaginationOptions;
  asset: Address;
  /** Map of icon components to be used in the table */
  icons?: Record<string, ComponentType<{ className?: string }> | LucideIcon>;
  /** Column definitions for the table */
  columns: Parameters<typeof useReactTable<PermissionWithRoles>>[0]['columns'];
}

export function PermissionsTableClient({
  queryKey,
  toolbar,
  pagination,
  asset,
  columns,
  icons,
}: PermissionsTableClientProps) {
  const { data } = useSuspenseQuery<PermissionWithRoles[]>({
    queryKey,
    queryFn: () => getPermissions(asset),
    refetchInterval: 5000,
  });

  return (
    <DataTable
      columns={columns}
      data={data}
      icons={icons}
      name={'Permissions'}
      toolbar={toolbar}
      pagination={pagination}
    />
  );
}
