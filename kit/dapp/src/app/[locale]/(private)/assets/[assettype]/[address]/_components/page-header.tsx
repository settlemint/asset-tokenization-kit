import { ActivePill } from '@/components/blocks/active-pill/active-pill';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/blocks/evm-address/evm-address-balances';
import { PageHeader } from '@/components/layout/page-header';
import { getTranslations } from 'next-intl/server';
import type { Address } from 'viem';
import type { AssetType } from '../../types';
import { getDetailData } from './detail-data';
import { ManageDropdown } from './manage-dropdown/manage-dropdown';

interface PageHeaderProps {
  address: Address;
  assettype: AssetType;
}

export async function DetailPageHeader({
  address,
  assettype,
}: PageHeaderProps) {
  const details = await getDetailData({ address, assettype });
  const t = await getTranslations('private.assets.details');

  return (
    <PageHeader
      title={
        <>
          <span className="mr-2">{details.name}</span>
          <span className="text-muted-foreground">({details.symbol})</span>
        </>
      }
      subtitle={
        <EvmAddress address={address} prettyNames={false}>
          <EvmAddressBalances address={address} />
        </EvmAddress>
      }
      section={t('asset-management')}
      pill={<ActivePill paused={'paused' in details ? details.paused : true} />}
      button={
        <ManageDropdown
          address={address}
          assettype={assettype}
          detail={details}
        />
      }
    />
  );
}
