import { ActivePill } from '@/components/blocks/active-pill/active-pill';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/blocks/evm-address/evm-address-balances';
import { PageHeader } from '@/components/layout/page-header';
import { getStableCoinDetail } from '@/lib/queries/stablecoin/stablecoin-detail';
import { getTranslations } from 'next-intl/server';
import type { Address } from 'viem';
import { ManageDropdown } from './manage-dropdown';

interface PageHeaderProps {
  address: Address;
}

export async function StableCoinPageHeader({ address }: PageHeaderProps) {
  const stableCoin = await getStableCoinDetail({ address });
  const t = await getTranslations('admin.stablecoins.table');

  return (
    <PageHeader
      title={
        <>
          <span className="mr-2">{stableCoin.name}</span>
          <span className="text-muted-foreground">({stableCoin.symbol})</span>
        </>
      }
      subtitle={
        <EvmAddress address={address} prettyNames={false}>
          <EvmAddressBalances address={address} />
        </EvmAddress>
      }
      section={t('asset-management')}
      pill={<ActivePill paused={stableCoin.paused} />}
      button={<ManageDropdown address={address} stableCoin={stableCoin} />}
    />
  );
}
