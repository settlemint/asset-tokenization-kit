import { BurnForm } from "@/app/[locale]/(private)/portfolio/my-assets/[assettype]/[address]/_components/burn-form/form";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { MintForm } from "../../../_components/mint-form/form";

interface BondsRelatedProps {
  address: Address;
  assetDetails: Awaited<ReturnType<typeof getAssetDetail>>;
  userBalance: Awaited<ReturnType<typeof getAssetBalanceDetail>>;
  userIsAdmin: boolean;
}

export async function BondsRelated({
  address,
  assetDetails,
  userBalance,
  userIsAdmin,
}: BondsRelatedProps) {
  const t = await getTranslations("private.assets.details.related");

  const isBlocked = userBalance?.blocked ?? false;
  const isPaused = "paused" in assetDetails && assetDetails.paused;
  console.log("BONDS", userBalance);
  const userIsSupplyManager = userBalance?.asset.supplyManagers.some(
    (manager) => manager.id === userBalance?.account.id
  );

  return (
    <RelatedGrid title={t("title")}>
      <RelatedGridItem
        title={t("increase-supply.title.bonds")}
        description={t("increase-supply.description.bonds")}
      >
        <MintForm
          address={address}
          assettype="bond"
          decimals={assetDetails.decimals}
          symbol={assetDetails.symbol}
          asButton
          disabled={
            isBlocked || isPaused || (!userIsSupplyManager && !userIsAdmin)
          }
        />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("decrease-supply.title.bonds")}
        description={t("decrease-supply.description.bonds")}
      >
        <BurnForm
          address={address}
          max={userBalance?.available ?? 0}
          decimals={assetDetails.decimals}
          symbol={assetDetails.symbol}
          assettype="bond"
          asButton
          disabled={
            isBlocked || isPaused || (!userIsSupplyManager && !userIsAdmin)
          }
        />
      </RelatedGridItem>
    </RelatedGrid>
  );
}
