import { ActivePill } from "@/components/blocks/active-pill/active-pill";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { PageHeader } from "@/components/layout/page-header";
import { getEquityDetail } from "@/lib/queries/equity/equity-detail";
import type { Address } from "viem";
import { ManageDropdown } from "./manage-dropdown";

interface PageHeaderProps {
  address: Address;
}

export async function EquityPageHeader({ address }: PageHeaderProps) {
  const equity = await getEquityDetail({ address });

  return (
    <PageHeader
      title={
        <>
          <span className="mr-2">{equity.name}</span>
          <span className="text-muted-foreground">({equity.symbol})</span>
        </>
      }
      subtitle={
        <EvmAddress address={address} prettyNames={false}>
          <EvmAddressBalances address={address} />
        </EvmAddress>
      }
      pill={<ActivePill paused={equity.paused} />}
      button={<ManageDropdown address={address} equity={equity} />}
    />
  );
}
