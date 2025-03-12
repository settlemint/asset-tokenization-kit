import { ActivePill } from "@/components/blocks/active-pill/active-pill";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { PageHeader } from "@/components/layout/page-header";
import { getEquityDetail } from "@/lib/queries/equity/equity-detail";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface PageHeaderProps {
  address: Address;
}

export async function EquityPageHeader({ address }: PageHeaderProps) {
  const equity = await getEquityDetail({ address });
  const t = await getTranslations("admin.equities.table");
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
      section={t("asset-management")}
      pill={<ActivePill paused={equity.paused} />}
    />
  );
}
