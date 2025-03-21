import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import type { getTokenizedDepositDetail } from "@/lib/queries/tokenizeddeposit/tokenizeddeposit-detail";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { BurnForm } from "../../../_components/manage-dropdown/burn-form/form";
import { UpdateCollateralForm } from "../../../_components/manage-dropdown/update-collateral-form/form";
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
  const maxMint = tokenizedDeposit.freeCollateral;

  return (
    <RelatedGrid title={t("title")}>
      <RelatedGridItem
        title={t("update-collateral.title")}
        description={t("update-collateral.description.tokenizeddeposits")}
      >
        <UpdateCollateralForm
          address={address}
          assettype="tokenizeddeposit"
          asButton
          disabled={isBlocked || isPaused || !userIsSupplyManager}
        />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("increase-supply.title.tokenizeddeposits")}
        description={t("increase-supply.description.tokenizeddeposits")}
      >
        <MintForm
          address={address}
          assettype="tokenizeddeposit"
          asButton
          disabled={isBlocked || isPaused || !userIsSupplyManager}
          max={maxMint}
          decimals={tokenizedDeposit.decimals}
          symbol={tokenizedDeposit.symbol}
        />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("decrease-supply.title.tokenizeddeposits")}
        description={t("decrease-supply.description.tokenizeddeposits")}
      >
        <BurnForm
          address={address}
          max={userBalance?.available ?? 0}
          decimals={tokenizedDeposit.decimals}
          symbol={tokenizedDeposit.symbol}
          assettype="tokenizeddeposit"
          asButton
          disabled={isBlocked || isPaused || !userIsSupplyManager}
        />
      </RelatedGridItem>
    </RelatedGrid>
  );
}
