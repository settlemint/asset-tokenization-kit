'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import { defaultRefetchInterval } from '@/lib/react-query';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { columns, icons } from './contacts-table-columns';
import { type TransactionListItem, getTransactionsList } from './contacts-table-data';
interface ContactsTableClientProps {
  queryKey: QueryKey;
  from?: Address;
}

export function ContactsTableClient({ queryKey, from }: ContactsTableClientProps) {
  const { data } = useSuspenseQuery<TransactionListItem[]>({
    queryKey,
    queryFn: () => getTransactionsList(from),
    refetchInterval: defaultRefetchInterval,
  });

  return <DataTable columns={columns} data={data} icons={icons ?? {}} name={'Contacts'} />;
}
