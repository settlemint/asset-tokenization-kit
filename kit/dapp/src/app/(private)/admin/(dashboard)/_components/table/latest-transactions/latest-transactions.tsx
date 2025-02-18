import { AssetsEventsTable } from '@/components/blocks/asset-events-table/asset-events-table';
import Link from 'next/link';

export default function LatestTransactions() {
  const first = 5;

  return (
    <>
      <AssetsEventsTable first={first} />
      <div className="mt-4">
        <Link href="/admin/transactions" className="text-muted-foreground text-sm hover:text-primary">
          View all transactions →
        </Link>
      </div>
    </>
  );
}
