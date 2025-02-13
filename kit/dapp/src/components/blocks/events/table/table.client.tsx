'use client';

import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { DataTable } from '../../data-table/data-table';
import type { DataTablePaginationOptions } from '../../data-table/data-table-pagination';
import type { DataTableToolbarOptions } from '../../data-table/data-table-toolbar';
import type { NormalizedTransactionListItem } from '../fragments';
import { columns, icons } from './columns';
import { getTransactionsList } from './data';

interface TransactionsTableClientProps extends DataTablePaginationOptions, DataTableToolbarOptions {
  queryKey: QueryKey;
  first?: number;
}

export function TransactionsTableClient({ queryKey, first, ...props }: TransactionsTableClientProps) {
  const { data } = useSuspenseQuery<NormalizedTransactionListItem[]>({
    queryKey,
    queryFn: () => getTransactionsList(first),
    refetchInterval: 5000,
  });

  return <DataTable columns={columns} data={data} icons={icons ?? {}} name={'Transactions'} {...props} />;
}
