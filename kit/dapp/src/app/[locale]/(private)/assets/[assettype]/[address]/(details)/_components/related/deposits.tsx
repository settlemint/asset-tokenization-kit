import { BurnForm } from "@/app/[locale]/(private)/portfolio/my-assets/[assettype]/[address]/_components/burn-form/form";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import type { getDepositDetail } from "@/lib/queries/deposit/deposit-detail";
import { isBefore } from "date-fns";
import { useTranslations } from "next-intl";
import { UpdateCollateralForm } from "../../../_components/manage-dropdown/update-collateral-form/form";
import { MintForm } from "../../../_components/mint-form/form";

export interface DepositsRelatedProps {
  address: `0x${string}`;
  assetDetails: Awaited<ReturnType<typeof getDepositDetail>>;
  userBalance: Awaited<ReturnType<typeof getAssetBalanceDetail>>;
}

export function DepositsRelated({
  address,
  assetDetails,
  userBalance,
}: DepositsRelatedProps) {
  const t = useTranslations("private.assets.details.related");

  const isBlocked = userBalance?.blocked ?? false;
  const isPaused = "paused" in assetDetails && assetDetails.paused;
  const userIsSupplyManager = userBalance?.asset.supplyManagers.some(
    (manager) => manager.id === userBalance?.account.id
  );
  const collateralIsExpired =
    "collateralProofValidity" in assetDetails &&
    assetDetails.collateralProofValidity !== undefined &&
    isBefore(assetDetails.collateralProofValidity, new Date());

  const deposit = assetDetails;
  const maxMint = deposit.freeCollateral;

  return (
    <RelatedGrid title={t("title")}>
      <RelatedGridItem
        title={t("update-collateral.title")}
        description={t("update-collateral.description.deposits")}
      >
        <UpdateCollateralForm
          address={address}
          assettype="deposit"
          asButton
          disabled={isBlocked || isPaused || !userIsSupplyManager}
          decimals={deposit.decimals}
          symbol={deposit.symbol}
        />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("increase-supply.title.deposits")}
        description={t("increase-supply.description.deposits")}
      >
        <MintForm
          address={address}
          max={maxMint}
          assettype="deposit"
          decimals={assetDetails.decimals}
          symbol={assetDetails.symbol}
          asButton
          disabled={isBlocked || isPaused || !userIsSupplyManager}
        />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("decrease-supply.title.deposits")}
        description={t("decrease-supply.description.deposits")}
      >
        <BurnForm
          address={address}
          max={userBalance?.available ?? 0}
          decimals={assetDetails.decimals}
          symbol={assetDetails.symbol}
          assettype="deposit"
          asButton
          disabled={isBlocked || isPaused || !userIsSupplyManager}
        />
      </RelatedGridItem>
    </RelatedGrid>
  );
}
