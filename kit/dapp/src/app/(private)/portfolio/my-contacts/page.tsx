import { ContactsTable } from '@/components/blocks/contacts-table/contacts-table';
import { getAuthenticatedUser } from '@/lib/auth/auth';
import type { Metadata } from 'next';
import type { Address } from 'viem';
import { MyContactsHeader } from './(table)/_components/my-contacts-header/my-contacts-header';

export const metadata: Metadata = {
  title: 'My Contacts',
  description: 'Manage all your contacts.',
};

export default async function ContactsPage() {
  const user = await getAuthenticatedUser();
  return (
    <>
      <MyContactsHeader />
      <ContactsTable from={user.wallet as Address} />
    </>
  );
}
