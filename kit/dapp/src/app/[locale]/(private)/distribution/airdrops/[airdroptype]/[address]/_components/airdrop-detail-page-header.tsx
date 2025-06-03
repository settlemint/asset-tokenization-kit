import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { PageHeader } from "@/components/layout/page-header";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import type { Address } from "viem";

interface AirdropDetailPageHeaderProps {
  address: Address;
  manageDropdown: () => ReactNode;
}

export async function AirdropDetailPageHeader({
  address,
  manageDropdown,
}: AirdropDetailPageHeaderProps) {
  const t = await getTranslations("private.airdrops.details");

  return (
    <PageHeader
      title={address}
      subtitle={
        <EvmAddress address={address} prettyNames={false}>
          <EvmAddressBalances address={address} />
        </EvmAddress>
      }
      section={t("airdrop-management")}
      button={manageDropdown()}
    />
  );
}
