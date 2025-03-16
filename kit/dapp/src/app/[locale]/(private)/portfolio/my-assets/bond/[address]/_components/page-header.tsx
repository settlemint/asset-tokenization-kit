import { ActivePill } from '@/components/blocks/active-pill/active-pill';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/blocks/evm-address/evm-address-balances';
import { PageHeader } from '@/components/layout/page-header';
import { getBondDetail } from '@/lib/queries/bond/bond-detail';
import { getTranslations } from 'next-intl/server';
import type { Address } from 'viem';
import { ManageDropdown } from './manage-dropdown';

interface PageHeaderProps {
  address: Address;
}

export async function BondPageHeader({ address }: PageHeaderProps) {
  const bond = await getBondDetail({ address });
  const t = await getTranslations('admin.bonds.table');

  return (
    <PageHeader
      title={
        <>
          <span className="mr-2">{bond.name}</span>
          <span className="text-muted-foreground">({bond.symbol})</span>
        </>
      }
      subtitle={
        <EvmAddress address={address} prettyNames={false}>
          <EvmAddressBalances address={address} />
        </EvmAddress>
      }
      section={t('asset-management')}
      pill={<ActivePill paused={bond.paused} />}
      button={<ManageDropdown address={address} bond={bond} />}
    />
  );
}
