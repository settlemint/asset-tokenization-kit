import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import type { getDepositDetail } from "@/lib/queries/deposit/deposit-detail";
import { isBefore } from "date-fns";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { BurnForm } from "../../../_components/manage-dropdown/burn-form/form";
import { UpdateCollateralForm } from "../../../_components/manage-dropdown/update-collateral-form/form";
import { MintForm } from "../../../_components/mint-form/form";

interface DepositsRelatedProps {
  address: Address;
  assetDetails: Awaited<ReturnType<typeof getAssetDetail>>;
  userBalance: Awaited<ReturnType<typeof getAssetBalanceDetail>>;
}

export async function DepositsRelated({
  address,
  assetDetails,
  userBalance,
}: DepositsRelatedProps) {
  const t = await getTranslations("private.assets.details.related");

  const isBlocked = userBalance?.blocked ?? false;
  const isPaused = "paused" in assetDetails && assetDetails.paused;
  const userIsSupplyManager = userBalance?.asset.supplyManagers.some(
    (manager) => manager.id === userBalance?.account.id
  );
  const collateralIsExpired =
    "collateralProofValidity" in assetDetails &&
    assetDetails.collateralProofValidity !== undefined &&
    isBefore(assetDetails.collateralProofValidity, new Date());

  const deposit = assetDetails as Awaited<ReturnType<typeof getDepositDetail>>;
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
          assettype="deposit"
          asButton
          disabled={
            isBlocked || isPaused || !userIsSupplyManager || collateralIsExpired
          }
          max={maxMint}
          decimals={deposit.decimals}
          symbol={deposit.symbol}
        />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("decrease-supply.title.deposits")}
        description={t("decrease-supply.description.deposits")}
      >
        <BurnForm
          address={address}
          max={userBalance?.available ?? 0}
          decimals={deposit.decimals}
          symbol={deposit.symbol}
          assettype="deposit"
          asButton
          disabled={
            isBlocked || isPaused || !userIsSupplyManager || collateralIsExpired
          }
        />
      </RelatedGridItem>
    </RelatedGrid>
  );
}
