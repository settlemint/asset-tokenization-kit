import { AssetEventsTable } from '@/components/blocks/asset-events-table/asset-events-table';
import { getAuthenticatedUser } from '@/lib/auth/auth';
import Link from 'next/link';
import type { Address } from 'viem';

export async function LatestEvents() {
  const user = await getAuthenticatedUser();
  const first = 5;

  return (
    <>
      <AssetEventsTable variables={{ first, sender: user.wallet as Address }} disableToolbarAndPagination={true} />
      <Link href="/portfolio/activity/events" className="text-muted-foreground text-sm hover:text-primary">
        View all events →
      </Link>
    </>
  );
}
