import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { formatNumber } from "@/lib/utils/number";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { BurnForm } from "../../../_components/manage-dropdown/burn-form/form";
import { MintForm } from "../../../_components/manage-dropdown/mint-form/form";

interface FundsRelatedProps {
  address: Address;
  assetDetails: Awaited<ReturnType<typeof getAssetDetail>>;
  userBalance: Awaited<ReturnType<typeof getAssetBalanceDetail>>;
}

export async function FundsRelated({
  address,
  assetDetails,
  userBalance,
}: FundsRelatedProps) {
  const t = await getTranslations("private.assets.details.related");

  const isBlocked = userBalance?.blocked ?? false;
  const isPaused = "paused" in assetDetails && assetDetails.paused;
  const userIsSupplyManager = userBalance?.asset.supplyManagers.some(
    (manager) => manager.id === userBalance?.account.id
  );

  return (
    <RelatedGrid title={t("title")}>
      <RelatedGridItem
        title={t("funds.increase-supply.title")}
        description={t("funds.increase-supply.description")}
      >
        <MintForm
          address={address}
          assettype="fund"
          asButton
          disabled={isBlocked || isPaused || !userIsSupplyManager}
        />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("funds.decrease-supply.title")}
        description={t("funds.decrease-supply.description")}
      >
        <BurnForm
          address={address}
          maxLimit={userBalance?.available}
          maxLimitDescription={t("available-balance", {
            maxLimit: formatNumber(userBalance?.available ?? 0),
          })}
          assettype="fund"
          asButton
          disabled={isBlocked || isPaused || !userIsSupplyManager}
        />
      </RelatedGridItem>
    </RelatedGrid>
  );
}
