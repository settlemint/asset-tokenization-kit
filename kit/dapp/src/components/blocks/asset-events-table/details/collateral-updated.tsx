import type { CollateralUpdatedEvent } from '@/lib/queries/asset-events/asset-events-fragments';
import { formatNumber } from '@/lib/utils/number';
import { useTranslations } from 'next-intl';
import { DetailsCard } from '../details-card';

interface CollateralUpdatedDetailsProps {
  details: CollateralUpdatedEvent;
}

export function CollateralUpdatedDetails({
  details,
}: CollateralUpdatedDetailsProps) {
  const t = useTranslations('components.asset-events-table.details');

  const detailItems = [
    {
      key: 'old-amount',
      label: t('old-amount'),
      value: formatNumber(details.oldAmount),
    },
    {
      key: 'new-amount',
      label: t('new-amount'),
      value: formatNumber(details.newAmount),
    },
  ];

  return <DetailsCard details={detailItems} />;
}
