'use client';

import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { DataTable } from '../../data-table/data-table';
import type { DataTablePaginationOptions } from '../../data-table/data-table-pagination';
import type { DataTableToolbarOptions } from '../../data-table/data-table-toolbar';
import type { NormalizedTransactionListItem } from '../fragments';
import { columns, icons } from './columns';
import { getTransactionsList } from './data';

interface TransactionsTableClientProps {
  queryKey: QueryKey;
  first?: number;
  toolbar?: DataTableToolbarOptions;
  pagination?: DataTablePaginationOptions;
}

export function TransactionsTableClient({ queryKey, first, toolbar, pagination }: TransactionsTableClientProps) {
  const { data } = useSuspenseQuery<NormalizedTransactionListItem[]>({
    queryKey,
    queryFn: () => getTransactionsList(first),
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
