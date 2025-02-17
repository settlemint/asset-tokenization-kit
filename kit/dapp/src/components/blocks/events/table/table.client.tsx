'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import type { DataTablePaginationOptions } from '@/components/blocks/data-table/data-table-pagination';
import type { DataTableToolbarOptions } from '@/components/blocks/data-table/data-table-toolbar';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import type { NormalizedTransactionListItem } from '../fragments';
import { columns, icons } from './columns';
import { getTransactionsList } from './data';

interface TransactionsTableClientProps {
  queryKey: QueryKey;
  first?: number;
  toolbar?: DataTableToolbarOptions;
  pagination?: DataTablePaginationOptions;
  asset?: string;
}

export function TransactionsTableClient({ queryKey, first, toolbar, pagination, asset }: TransactionsTableClientProps) {
  const { data } = useSuspenseQuery<NormalizedTransactionListItem[]>({
    queryKey,
    queryFn: () => getTransactionsList(first, asset),
    refetchInterval: 5000,
  });

  return (
    <DataTable
      columns={columns}
      data={data}
      icons={icons ?? {}}
      name={'Transactions'}
      toolbar={toolbar}
      pagination={pagination}
    />
  );
}
