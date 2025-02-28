import { ActivePill } from '@/components/blocks/active-pill/active-pill';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/blocks/evm-address/evm-address-balances';
import { PageHeader } from '@/components/layout/page-header';
import { getFundDetail } from '@/lib/queries/fund/fund-detail';
import type { Address } from 'viem';
import { ManageDropdown } from './manage-dropdown';

interface PageHeaderProps {
  address: Address;
}

export async function FundPageHeader({ address }: PageHeaderProps) {
  const fund = await getFundDetail({ address });

  return (
    <PageHeader
      title={
        <>
          <span className="mr-2">{fund.name}</span>
          <span className="text-muted-foreground">({fund.symbol})</span>
        </>
      }
      subtitle={
        <EvmAddress address={address} prettyNames={false}>
          <EvmAddressBalances address={address} />
        </EvmAddress>
      }
      pill={<ActivePill paused={fund.paused} />}
      button={<ManageDropdown address={address} />}
    />
  );
}
