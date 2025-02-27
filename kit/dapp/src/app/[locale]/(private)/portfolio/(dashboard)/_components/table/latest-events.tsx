import { AssetEventsTable } from '@/components/blocks/asset-events-table/asset-events-table';
import { Link } from '@/i18n/routing';

export function LatestEvents() {
  return (
    <>
      <AssetEventsTable disableToolbarAndPagination={true} limit={5} />
      <Link
        href="/admin/activity/events"
        className="mt-4 text-muted-foreground text-sm hover:text-primary"
      >
        View all events →
      </Link>
    </>
  );
}
