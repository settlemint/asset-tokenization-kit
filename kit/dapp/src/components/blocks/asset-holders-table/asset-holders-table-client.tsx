'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import type { DataTablePaginationOptions } from '@/components/blocks/data-table/data-table-pagination';
import type { DataTableToolbarOptions } from '@/components/blocks/data-table/data-table-toolbar';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import type { useReactTable } from '@tanstack/react-table';
import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';
import type { Address } from 'viem';
import type { Holder } from './asset-holders-table-data';
import { getHolders } from './asset-holders-table-data';

interface HoldersTableClientProps {
  queryKey: QueryKey;
  first?: number;
  toolbar?: DataTableToolbarOptions;
  pagination?: DataTablePaginationOptions;
  asset: Address;
  /** Map of icon components to be used in the table */
  icons?: Record<string, ComponentType<{ className?: string }> | LucideIcon>;
  /** Column definitions for the table */
  columns: Parameters<typeof useReactTable<Holder>>[0]['columns'];
}

export function HoldersTableClient({ queryKey, toolbar, pagination, asset, columns, icons }: HoldersTableClientProps) {
  const { data } = useSuspenseQuery<Holder[]>({
    queryKey,
    queryFn: () => getHolders(asset),
  });

  return (
    <DataTable columns={columns} data={data} icons={icons} name={'Holders'} toolbar={toolbar} pagination={pagination} />
  );
}
