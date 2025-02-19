import { getBlockExplorerAllTxUrl } from '@/lib/block-explorer';
import type { Metadata } from 'next';
import Link from 'next/link';
import { TransactionsTable } from './_components/transactions-table';

export const metadata: Metadata = {
  title: 'Transactions',
  description: 'Inspect all transactions on the network.',
};

export default function TransactionsPage() {
  const explorerUrl = getBlockExplorerAllTxUrl();
  return (
    <>
      <TransactionsTable />
      {explorerUrl && (
        <div className="mt-2 flex flex-col gap-4 text-right text-muted-foreground text-sm">
          <Link href={explorerUrl}>View all transactions in the explorer</Link>
        </div>
      )}
    </>
  );
}
