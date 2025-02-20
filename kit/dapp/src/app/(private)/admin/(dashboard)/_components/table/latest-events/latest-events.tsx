import { AssetEventsTable } from '@/components/blocks/asset-events-table/asset-events-table';
import Link from 'next/link';

export function LatestEvents() {
  const first = 5;

  return (
    <>
      <AssetEventsTable variables={{ first }} disableToolbarAndPagination={true} />
      <Link href="/admin/activity/events" className="text-muted-foreground text-sm hover:text-primary">
        View all events →
      </Link>
    </>
  );
}
