import { TransactionsTable } from '@/components/blocks/transactions-table/transactions-table';
import { getAuthenticatedUser } from '@/lib/auth/auth';
import { getBlockExplorerAllTxUrl } from '@/lib/block-explorer';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { Address } from 'viem';

export const metadata: Metadata = {
  title: 'Transactions',
  description: 'Inspect all your transactions on the network.',
};

export default async function TransactionsPage() {
  const user = await getAuthenticatedUser();
  const explorerUrl = getBlockExplorerAllTxUrl();
  return (
    <>
      <TransactionsTable from={user.wallet as Address} />
      {explorerUrl && (
        <div className="mt-2 flex flex-col gap-4 text-right text-muted-foreground text-sm">
          <Link href={explorerUrl}>View all transactions in the explorer</Link>
        </div>
      )}
    </>
  );
}
