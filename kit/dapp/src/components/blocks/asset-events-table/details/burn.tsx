import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/blocks/evm-address/evm-address-balances';
import type { BurnEvent } from '@/lib/queries/asset-events/asset-events-fragments';
import { formatNumber } from '@/lib/utils/number';
import { useTranslations } from 'next-intl';
import { DetailsCard } from '../details-card';

interface BurnDetailsProps {
  details: BurnEvent;
  symbol?: string;
}

export function BurnDetails({ details, symbol }: BurnDetailsProps) {
  const t = useTranslations('components.asset-events-table.details');

  const detailItems = [
    {
      key: 'from',
      label: t('from'),
      value: (
        <EvmAddress address={details.from.id}>
          <EvmAddressBalances address={details.from.id} />
        </EvmAddress>
      ),
    },
    {
      key: 'value',
      label: t('value'),
      value: formatNumber(
        details.value,
        symbol ? { token: symbol } : undefined
      ),
    },
  ];

  return <DetailsCard details={detailItems} />;
}
