import { AssetEventsTable } from '@/components/blocks/asset-events-table/asset-events-table';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import type { Address } from 'viem';

interface LatestEventsProps {
  sender?: Address;
}

export function LatestEvents({ sender }: LatestEventsProps) {
  const t = useTranslations('admin.dashboard.table');

  return (
    <>
      <AssetEventsTable
        disableToolbarAndPagination={true}
        limit={5}
        sender={sender}
      />
      <Link
        href="/assets/activity/events"
        className="mt-4 text-muted-foreground text-sm hover:text-primary"
      >
        {t('latest-events.view-all')}
      </Link>
    </>
  );
}
