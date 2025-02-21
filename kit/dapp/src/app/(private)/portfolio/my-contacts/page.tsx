import { TransactionsTable } from '@/components/blocks/transactions-table/transactions-table';
import { getAuthenticatedUser } from '@/lib/auth/auth';
import type { Metadata } from 'next';
import type { Address } from 'viem';

export const metadata: Metadata = {
  title: 'My Contacts',
  description: 'Manage all your contacts.',
};

export default async function TransactionsPage() {
  const user = await getAuthenticatedUser();
  return (
    <>
      <TransactionsTable from={user.wallet as Address} />
    </>
  );
}
