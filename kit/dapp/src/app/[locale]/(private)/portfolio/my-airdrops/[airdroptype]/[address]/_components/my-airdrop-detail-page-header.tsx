import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { PageHeader } from "@/components/layout/page-header";
import { getUser } from "@/lib/auth/utils";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface MyAirdropDetailPageHeaderProps {
  address: Address;
}

export async function MyAirdropDetailPageHeader({
  address,
}: MyAirdropDetailPageHeaderProps) {
  const t = await getTranslations("private.airdrops.details");
  const user = await getUser();

  return (
    <PageHeader
      title={address}
      subtitle={
        <EvmAddress address={address} prettyNames={false}>
          <EvmAddressBalances address={address} />
        </EvmAddress>
      }
      section={t("airdrop-management")}
      // button={
      //   <MyAirdropManageDropdown
      //     address={address}
      //   />
      // }
    />
  );
}
