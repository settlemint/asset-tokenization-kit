'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { columns, icons } from './transactions-table-columns';
import { type TransactionListItem, getTransactionsList } from './transactions-table-data';

interface TransactionsTableClientProps {
  queryKey: QueryKey;
}

export function TransactionsTableClient({ queryKey }: TransactionsTableClientProps) {
  const { data } = useSuspenseQuery<TransactionListItem[]>({
    queryKey,
    queryFn: () => getTransactionsList(),
  });

  return <DataTable columns={columns} data={data} icons={icons ?? {}} name={'Transactions'} />;
}
