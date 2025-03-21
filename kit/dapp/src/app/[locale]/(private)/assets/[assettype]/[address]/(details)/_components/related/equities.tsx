import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { BurnForm } from "../../../_components/manage-dropdown/burn-form/form";
import { MintForm } from "../../../_components/mint-form/form";

interface EquitiesRelatedProps {
  address: Address;
  assetDetails: Awaited<ReturnType<typeof getAssetDetail>>;
  userBalance: Awaited<ReturnType<typeof getAssetBalanceDetail>>;
}

export async function EquitiesRelated({
  address,
  assetDetails,
  userBalance,
}: EquitiesRelatedProps) {
  const t = await getTranslations("private.assets.details.related");

  const isBlocked = userBalance?.blocked ?? false;
  const isPaused = "paused" in assetDetails && assetDetails.paused;
  const userIsSupplyManager = userBalance?.asset.supplyManagers.some(
    (manager) => manager.id === userBalance?.account.id
  );

  return (
    <RelatedGrid title={t("title")}>
      <RelatedGridItem
        title={t("increase-supply.title.equities")}
        description={t("increase-supply.description.equities")}
      >
        <MintForm
          address={address}
          decimals={assetDetails.decimals}
          symbol={assetDetails.symbol}
          assettype="equity"
          asButton
          disabled={isBlocked || isPaused || !userIsSupplyManager}
        />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("decrease-supply.title.equities")}
        description={t("decrease-supply.description.equities")}
      >
        <BurnForm
          address={address}
          max={userBalance?.available ?? 0}
          decimals={assetDetails.decimals}
          symbol={assetDetails.symbol}
          assettype="equity"
          asButton
          disabled={isBlocked || isPaused || !userIsSupplyManager}
        />
      </RelatedGridItem>
    </RelatedGrid>
  );
}
