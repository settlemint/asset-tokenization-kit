import { AssetEventsTable } from '@/components/blocks/asset-events-table/asset-events-table';
import Link from 'next/link';

export default function LatestTransactions() {
  const first = 5;

  return (
    <>
      <AssetEventsTable variables={{ first }} disableToolbarAndPagination={true} />
      <div className="mt-4">
        <Link href="/admin/activity" className="text-muted-foreground text-sm hover:text-primary">
          View all activity →
        </Link>
      </div>
    </>
  );
}
