import type { Metadata } from 'next';
import Link from 'next/link';
import { TransactionsTable } from './_components/transactions-table';

export const metadata: Metadata = {
  title: 'Transactions',
  description: 'Inspect all transactions on the network.',
};

export default function TransactionsPage() {
  return (
    <>
      <TransactionsTable />
      {process.env.NEXT_PUBLIC_EXPLORER_URL && (
        <div className="mt-2 flex flex-col gap-4 text-right text-muted-foreground text-sm">
          <Link href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/transactions`}>
            View all transactions in the explorer
          </Link>
        </div>
      )}
    </>
  );
}
