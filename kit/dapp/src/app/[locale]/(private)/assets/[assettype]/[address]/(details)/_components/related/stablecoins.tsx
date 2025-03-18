import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import type { getStableCoinDetail } from "@/lib/queries/stablecoin/stablecoin-detail";
import { formatNumber } from "@/lib/utils/number";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { BurnForm } from "../../../_components/manage-dropdown/burn-form/form";
import { UpdateCollateralForm } from "../../../_components/manage-dropdown/update-collateral-form/form";
import { MintForm } from "../../../_components/mint-form/form";

interface StablecoinsRelatedProps {
  address: Address;
  assetDetails: Awaited<ReturnType<typeof getAssetDetail>>;
  userBalance: Awaited<ReturnType<typeof getAssetBalanceDetail>>;
}

export async function StablecoinsRelated({
  address,
  assetDetails,
  userBalance,
}: StablecoinsRelatedProps) {
  const t = await getTranslations("private.assets.details.related");

  const isBlocked = userBalance?.blocked ?? false;
  const isPaused = "paused" in assetDetails && assetDetails.paused;
  const userIsSupplyManager = userBalance?.asset.supplyManagers.some(
    (manager) => manager.id === userBalance?.account.id
  );

  const stablecoin = assetDetails as Awaited<
    ReturnType<typeof getStableCoinDetail>
  >;
  const freeCollateral = stablecoin.freeCollateral;
  const mintMaxLimit = freeCollateral;

  return (
    <RelatedGrid title={t("title")}>
      <RelatedGridItem
        title={t("stablecoins.update-collateral.title")}
        description={t("stablecoins.update-collateral.description")}
      >
        <UpdateCollateralForm
          address={address}
          assettype="stablecoin"
          asButton
          disabled={isBlocked || isPaused || !userIsSupplyManager}
        />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("stablecoins.increase-supply.title")}
        description={t("stablecoins.increase-supply.description")}
      >
        <MintForm
          address={address}
          assettype="stablecoin"
          asButton
          disabled={isBlocked || isPaused || !userIsSupplyManager}
          maxLimit={mintMaxLimit}
        />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("stablecoins.decrease-supply.title")}
        description={t("stablecoins.decrease-supply.description")}
      >
        <BurnForm
          address={address}
          maxLimit={userBalance?.available}
          maxLimitDescription={t("available-balance", {
            maxLimit: formatNumber(userBalance?.available ?? 0),
          })}
          assettype="stablecoin"
          asButton
          disabled={isBlocked || isPaused || !userIsSupplyManager}
        />
      </RelatedGridItem>
    </RelatedGrid>
  );
}
