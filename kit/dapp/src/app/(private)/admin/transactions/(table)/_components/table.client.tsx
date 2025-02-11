'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import { useSuspenseQuery } from '@tanstack/react-query';
import { columns, icons } from './columns';
import { type NormalizedTransactionListItem, getTransactionsList } from './data';

export function TransactionsTableClient() {
  const { data } = useSuspenseQuery<NormalizedTransactionListItem[]>({
    queryKey: ['transactionslist'],
    queryFn: getTransactionsList,
    refetchInterval: 5000,
  });

  return <DataTable columns={columns} data={data} icons={icons ?? {}} name={'Transactions'} />;
}
