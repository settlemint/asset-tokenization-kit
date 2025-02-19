'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import { defaultRefetchInterval } from '@/lib/react-query';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { getColumns, icons } from './transactions-table-columns';
import { type TransactionListItem, getTransactionsList } from './transactions-table-data';
interface TransactionsTableClientProps {
  queryKey: QueryKey;
  from?: Address;
}

export function TransactionsTableClient({ queryKey, from }: TransactionsTableClientProps) {
  const { data } = useSuspenseQuery<TransactionListItem[]>({
    queryKey,
    queryFn: () => getTransactionsList(from),
    refetchInterval: defaultRefetchInterval,
  });

  return <DataTable columns={getColumns(Boolean(from))} data={data} icons={icons ?? {}} name={'Transactions'} />;
}
