import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/blocks/evm-address/evm-address-balances';
import { PageHeader } from '@/components/layout/page-header';
import { getCryptoCurrencyDetail } from '@/lib/queries/cryptocurrency/cryptocurrency-detail';
import type { Address } from 'viem';
import { ManageDropdown } from './manage-dropdown';

interface PageHeaderProps {
  address: Address;
}

export async function CryptoCurrencyPageHeader({ address }: PageHeaderProps) {
  const cryptocurrency = await getCryptoCurrencyDetail({ address });

  return (
    <PageHeader
      title={
        <>
          <span className="mr-2">{cryptocurrency.name}</span>
          <span className="text-muted-foreground">
            ({cryptocurrency.symbol})
          </span>
        </>
      }
      subtitle={
        <EvmAddress address={address} prettyNames={false}>
          <EvmAddressBalances address={address} />
        </EvmAddress>
      }
      button={<ManageDropdown address={address} />}
    />
  );
}
