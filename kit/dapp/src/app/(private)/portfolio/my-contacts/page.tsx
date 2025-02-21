import { TransactionsTable } from '@/components/blocks/transactions-table/transactions-table';
import { getAuthenticatedUser } from '@/lib/auth/auth';
import type { Metadata } from 'next';
import type { Address } from 'viem';

export const metadata: Metadata = {
  title: 'Transactions',
  description: 'Inspect all your transactions on the network.',
};

export default async function TransactionsPage() {
  const user = await getAuthenticatedUser();
  return (
    <>
      <TransactionsTable from={user.wallet as Address} />
    </>
  );
}
