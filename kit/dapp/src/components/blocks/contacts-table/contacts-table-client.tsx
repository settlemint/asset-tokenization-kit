'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import { defaultRefetchInterval } from '@/lib/react-query';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { columns, icons } from './contacts-table-columns';
import { type ContactsListItem, getContactsList } from './contacts-table-data';

interface ContactsTableClientProps {
  queryKey: QueryKey;
  userId: string;
}

export function ContactsTableClient({ queryKey, userId }: ContactsTableClientProps) {
  const { data } = useSuspenseQuery<ContactsListItem[]>({
    queryKey,
    queryFn: () => getContactsList(userId),
    refetchInterval: defaultRefetchInterval,
  });

  return <DataTable columns={columns} data={data} icons={icons ?? {}} name={'Contacts'} />;
}
