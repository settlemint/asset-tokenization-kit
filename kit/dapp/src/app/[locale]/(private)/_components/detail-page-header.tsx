import { ActivePill } from '@/components/blocks/active-pill/active-pill';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/blocks/evm-address/evm-address-balances';
import { PageHeader } from '@/components/layout/page-header';
import { getAssetDetail } from '@/lib/queries/asset-detail';
import type { AssetType } from '@/lib/utils/zod';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import type { Address } from 'viem';

interface DetailPageHeaderProps {
  address: Address;
  assettype: AssetType;
  manageDropdown: (
    details: Awaited<ReturnType<typeof getAssetDetail>>
  ) => ReactNode;
}

export async function DetailPageHeader({
  address,
  assettype,
  manageDropdown,
}: DetailPageHeaderProps) {
  const details = await getAssetDetail({ address, assettype });
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
      pill={
        <ActivePill paused={'paused' in details ? details.paused : false} />
      }
      button={manageDropdown(details)}
    />
  );
}
