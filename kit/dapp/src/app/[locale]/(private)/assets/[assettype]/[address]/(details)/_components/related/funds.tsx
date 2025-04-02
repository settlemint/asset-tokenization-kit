import { BurnForm } from "@/app/[locale]/(private)/portfolio/my-assets/[assettype]/[address]/_components/burn-form/form";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { useTranslations } from "next-intl";
import { MintForm } from "../../../_components/mint-form/form";

export interface FundsRelatedProps {
  address: `0x${string}`;
  assetDetails: Awaited<ReturnType<typeof getAssetDetail>>;
  userBalance: Awaited<ReturnType<typeof getAssetBalanceDetail>>;
  userIsAdmin: boolean;
}

export function FundsRelated({
  address,
  assetDetails,
  userBalance,
  userIsAdmin,
}: FundsRelatedProps) {
  const t = useTranslations("private.assets.details.related");

  const isBlocked = userBalance?.blocked ?? false;
  const isPaused = "paused" in assetDetails && assetDetails.paused;
  const userIsSupplyManager = userBalance?.asset.supplyManagers.some(
    (manager) => manager.id === userBalance?.account.id
  );

  return (
    <RelatedGrid title={t("title")}>
      <RelatedGridItem
        title={t("increase-supply.title.funds")}
        description={t("increase-supply.description.funds")}
      >
        <MintForm
          address={address}
          assettype="fund"
          decimals={assetDetails.decimals}
          symbol={assetDetails.symbol}
          asButton
          disabled={
            isBlocked || isPaused || (!userIsSupplyManager && !userIsAdmin)
          }
        />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("decrease-supply.title.funds")}
        description={t("decrease-supply.description.funds")}
      >
        <BurnForm
          address={address}
          max={userBalance?.available ?? 0}
          decimals={assetDetails.decimals}
          symbol={assetDetails.symbol}
          assettype="fund"
          asButton
          disabled={isBlocked || isPaused || !userIsSupplyManager}
        />
      </RelatedGridItem>
    </RelatedGrid>
  );
}
