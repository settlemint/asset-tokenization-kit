import type {
  ManagementFeeCollectedEvent,
  PerformanceFeeCollectedEvent,
} from '@/lib/queries/asset-events/asset-events-fragments';
import { formatNumber } from '@/lib/utils/number';
import { useTranslations } from 'next-intl';
import { DetailsCard } from '../details-card';

interface FeeCollectedDetailsProps {
  details: ManagementFeeCollectedEvent | PerformanceFeeCollectedEvent;
}

export function FeeCollectedDetails({ details }: FeeCollectedDetailsProps) {
  const t = useTranslations('components.asset-events-table.details');

  const detailItems = [
    {
      key: 'amount',
      label: t('amount'),
      value: formatNumber(details.amount),
    },
  ];

  return <DetailsCard details={detailItems} />;
}
