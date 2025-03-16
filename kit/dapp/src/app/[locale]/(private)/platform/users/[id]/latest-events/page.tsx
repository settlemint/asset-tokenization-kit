import { AssetEventsTable } from '@/components/blocks/asset-events-table/asset-events-table';
import { getUserDetail } from '@/lib/queries/user/user-detail';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';

interface LatestTransactionsPageProps {
  params: Promise<{ id: string }>;
}

export default async function LatestEventsPage({
  params,
}: LatestTransactionsPageProps) {
  const { id } = await params;
  const t = await getTranslations('private.users.latest-events');
  const user = await getUserDetail({ id });

  return (
    <>
      <AssetEventsTable
        disableToolbarAndPagination={true}
        limit={10}
        sender={user.wallet}
      />
      <Link
        href={`/assets/activity/events?sender=${encodeURIComponent(
          user.wallet
        )}`}
        className="flex justify-end"
      >
        <Button variant="secondary" className="mt-4">
          {t('view-all')}
        </Button>
      </Link>
    </>
  );
}
