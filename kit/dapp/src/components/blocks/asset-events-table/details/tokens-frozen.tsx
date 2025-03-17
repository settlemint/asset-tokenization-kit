import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/blocks/evm-address/evm-address-balances';
import type { TokensFrozenEvent } from '@/lib/queries/asset-events/asset-events-fragments';
import { formatNumber } from '@/lib/utils/number';
import { useTranslations } from 'next-intl';
import { DetailsCard } from '../details-card';

interface TokensFrozenDetailsProps {
  details: TokensFrozenEvent;
}

export function TokensFrozenDetails({ details }: TokensFrozenDetailsProps) {
  const t = useTranslations('components.asset-events-table.details');

  const detailItems = [
    {
      key: 'user',
      label: t('user'),
      value: (
        <EvmAddress address={details.user.id}>
          <EvmAddressBalances address={details.user.id} />
        </EvmAddress>
      ),
    },
    {
      key: 'amount',
      label: t('amount'),
      value: formatNumber(details.amount),
    },
  ];

  return <DetailsCard details={detailItems} />;
}
