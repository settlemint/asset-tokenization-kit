import { UpdateCollateralForm } from "@/app/[locale]/(private)/assets/[assettype]/[address]/_components/manage-dropdown/update-collateral-form/form";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { getTokenizedDepositDetail } from "@/lib/queries/tokenizeddeposit/tokenizeddeposit-detail";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { BurnForm } from "../../../_components/manage-dropdown/burn-form/form";
import { MintForm } from "../../../_components/mint-form/form";

interface TokenizedDepositsRelatedProps {
  address: Address;
  assetDetails: Awaited<ReturnType<typeof getAssetDetail>>;
  userBalance: Awaited<ReturnType<typeof getAssetBalanceDetail>>;
}

export async function TokenizedDepositsRelated({
  address,
  assetDetails,
  userBalance,
}: TokenizedDepositsRelatedProps) {
  const t = await getTranslations("private.assets.details.related");

  const isBlocked = userBalance?.blocked ?? false;
  const isPaused = "paused" in assetDetails && assetDetails.paused;
  const userIsSupplyManager = userBalance?.asset.supplyManagers.some(
    (manager) => manager.id === userBalance?.account.id
  );

  const tokenizedDeposit = assetDetails as Awaited<
    ReturnType<typeof getTokenizedDepositDetail>
  >;
  const freeCollateral = tokenizedDeposit.freeCollateral;
  const mintMaxLimit = freeCollateral;

  return (
    <RelatedGrid title={t("title")}>
      <RelatedGridItem
        title={t("tokenizeddeposits.update-collateral.title")}
        description={t("tokenizeddeposits.update-collateral.description")}
      >
        <UpdateCollateralForm
          address={address}
          assettype="tokenizeddeposit"
          asButton
          disabled={isBlocked || isPaused || !userIsSupplyManager}
        />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("tokenizeddeposits.increase-supply.title")}
        description={t("tokenizeddeposits.increase-supply.description")}
      >
        <MintForm
          address={address}
          assettype="tokenizeddeposit"
          asButton
          disabled={isBlocked || isPaused || !userIsSupplyManager}
          maxLimit={mintMaxLimit}
        />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("tokenizeddeposits.decrease-supply.title")}
        description={t("tokenizeddeposits.decrease-supply.description")}
      >
        <BurnForm
          address={address}
          maxLimit={userBalance?.available}
          assettype="tokenizeddeposit"
          asButton
          disabled={isBlocked || isPaused || !userIsSupplyManager}
        />
      </RelatedGridItem>
    </RelatedGrid>
  );
}
