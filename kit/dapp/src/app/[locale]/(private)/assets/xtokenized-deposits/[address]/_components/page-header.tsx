import { ActivePill } from "@/components/blocks/active-pill/active-pill";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { PageHeader } from "@/components/layout/page-header";
import { getTokenizedDepositDetail } from "@/lib/queries/tokenizeddeposit/tokenizeddeposit-detail";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { ManageDropdown } from "./manage-dropdown";

interface PageHeaderProps {
  address: Address;
}

export async function TokenizedDepositPageHeader({ address }: PageHeaderProps) {
  const tokenizedDeposit = await getTokenizedDepositDetail({ address });
  const t = await getTranslations("admin.tokenized-deposits.table");

  return (
    <PageHeader
      title={
        <>
          <span className="mr-2">{tokenizedDeposit.name}</span>
          <span className="text-muted-foreground">
            ({tokenizedDeposit.symbol})
          </span>
        </>
      }
      subtitle={
        <EvmAddress address={address} prettyNames={false}>
          <EvmAddressBalances address={address} />
        </EvmAddress>
      }
      section={t("asset-management")}
      pill={<ActivePill paused={tokenizedDeposit.paused} />}
      button={
        <ManageDropdown address={address} tokenizedDeposit={tokenizedDeposit} />
      }
    />
  );
}
