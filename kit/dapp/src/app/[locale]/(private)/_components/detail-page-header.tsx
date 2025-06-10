import { MicaRegulationPill } from "@/app/[locale]/(private)/assets/[assettype]/[address]/_components/mica-regulation-pill";
import { ActivePill } from "@/components/blocks/active-pill/active-pill";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { PageHeader } from "@/components/layout/page-header";
import { getUser } from "@/lib/auth/utils";
import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { getAssetUsersDetail } from "@/lib/queries/asset/asset-users-detail";
import { getRegulationDetail } from "@/lib/queries/regulations/regulation-detail";
import { isMicaEnabledForAsset } from "@/lib/utils/features-enabled";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import type { Address } from "viem";

interface DetailPageHeaderProps {
  address: Address;
  assettype: AssetType;
  manageDropdown: (params: {
    assetDetails: Awaited<ReturnType<typeof getAssetDetail>>;
    assetUsersDetails: Awaited<ReturnType<typeof getAssetUsersDetail>>;
    userBalance: Awaited<ReturnType<typeof getAssetBalanceDetail>>;
    userUnderlyingAssetBalance: Awaited<
      ReturnType<typeof getAssetBalanceDetail>
    > | null;
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
      account: user.wallet,
    }),
    getAssetUsersDetail({ address }),
  ]);

  // const userUnderlyingAssetBalance =
  //   assettype === "bond"
  //     ? await getAssetBalanceDetail({
  //         address: (assetDetails as Awaited<ReturnType<typeof getBondDetail>>)
  //           .underlyingAsset.id,
  //         account: user.wallet,
  //       })
  //     : null;

  const isMicaEnabled = await isMicaEnabledForAsset(assettype, address);
  const micaRegulation = isMicaEnabled
    ? await getRegulationDetail({
        assetId: address,
        // regulationType: "mica",
      })
    : null;

  return (
    <PageHeader
      title={
        <>
          <span className="mr-2">
            {"name" in assetDetails ? assetDetails.name : ""}
          </span>
          <span className="text-muted-foreground">
            ({"symbol" in assetDetails ? assetDetails.symbol : ""})
          </span>
        </>
      }
      subtitle={
        <EvmAddress address={address} prettyNames={false}>
          <EvmAddressBalances address={address} />
        </EvmAddress>
      }
      section={t("asset-management")}
      pill={
        <div className="flex gap-2">
          <ActivePill
            paused={"paused" in assetDetails ? assetDetails.paused : false}
          />
          {micaRegulation?.mica_regulation_config && (
            <MicaRegulationPill
              config={micaRegulation.mica_regulation_config}
            />
          )}
        </div>
      }
      button={manageDropdown({
        assetDetails,
        userBalance,
        assetUsersDetails: assetUsersDetails as Awaited<
          ReturnType<typeof getAssetUsersDetail>
        >,
        userAddress: user.wallet,
        userUnderlyingAssetBalance: null,
      })}
    />
  );
}
