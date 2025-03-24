import { ActivePill } from "@/components/blocks/active-pill/active-pill";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { PageHeader } from "@/components/layout/page-header";
import { getUser } from "@/lib/auth/utils";
import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { getAssetUsersDetail } from "@/lib/queries/asset/asset-users-detail";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import type { Address } from "viem";

interface DetailPageHeaderProps {
  address: Address;
  assettype: AssetType;
  manageDropdown: (params: {
    assetDetails: Awaited<ReturnType<typeof getAssetDetail>>;
    userBalance: Awaited<ReturnType<typeof getAssetBalanceDetail>>;
    assetUsersDetails: Awaited<ReturnType<typeof getAssetUsersDetail>>;
    userAddress: Address;
  }) => ReactNode;
}

export async function DetailPageHeader({
  address,
  assettype,
  manageDropdown,
}: DetailPageHeaderProps) {
  const user = await getUser();
  const [assetDetails, t, userBalance, assetUsersDetails] = await Promise.all([
    getAssetDetail({ address, assettype }),
    getTranslations("private.assets.details"),
    getAssetBalanceDetail({
      address,
      account: user.wallet as Address,
    }),
    getAssetUsersDetail({ address }),
  ]);

  return (
    <PageHeader
      title={
        <>
          <span className="mr-2">{assetDetails.name}</span>
          <span className="text-muted-foreground">({assetDetails.symbol})</span>
        </>
      }
      subtitle={
        <EvmAddress address={address} prettyNames={false}>
          <EvmAddressBalances address={address} />
        </EvmAddress>
      }
      section={t("asset-management")}
      pill={
        <ActivePill
          paused={"paused" in assetDetails ? assetDetails.paused : false}
        />
      }
      button={manageDropdown({
        assetDetails,
        userBalance,
        assetUsersDetails,
        userAddress: user.wallet as Address,
      })}
    />
  );
}
