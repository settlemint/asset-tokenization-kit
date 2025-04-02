import { BurnForm } from "@/app/[locale]/(private)/portfolio/my-assets/[assettype]/[address]/_components/burn-form/form";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { ROLES } from "@/lib/config/roles";
import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getAssetUsersDetail } from "@/lib/queries/asset/asset-users-detail";
import type { getDepositDetail } from "@/lib/queries/deposit/deposit-detail";
import { isBefore } from "date-fns";
import { getTranslations } from "next-intl/server";
import { getAddress, type Address } from "viem";
import { UpdateCollateralForm } from "../../../_components/manage-dropdown/update-collateral-form/form";
import { MintForm } from "../../../_components/mint-form/form";

export interface DepositsRelatedProps {
  address: `0x${string}`;
  assetDetails: Awaited<ReturnType<typeof getDepositDetail>>;
  userBalance: Awaited<ReturnType<typeof getAssetBalanceDetail>>;
  assetUsersDetails?: Awaited<ReturnType<typeof getAssetUsersDetail>>;
  currentUserWallet?: Address;
}

export async function DepositsRelated({
  address,
  assetDetails,
  userBalance,
  assetUsersDetails,
  currentUserWallet,
}: DepositsRelatedProps) {
  const t = await getTranslations("private.assets.details.related");

  const isBlocked = userBalance?.blocked ?? false;
  const isPaused = "paused" in assetDetails && assetDetails.paused;

  // Determine if user is supply manager using assetUsersDetails first
  let userIsSupplyManager = false;

  if (currentUserWallet && assetUsersDetails) {
    try {
      const normalizedUserAddress = getAddress(currentUserWallet);

      const userRoleInfo = assetUsersDetails.roles.find((role) => {
        try {
          return getAddress(role.id) === normalizedUserAddress;
        } catch {
          return false;
        }
      });

      const userRoles = userRoleInfo?.roles ?? [];

      userIsSupplyManager = userRoles.includes(
        ROLES.SUPPLY_MANAGEMENT_ROLE.contractRole
      );
    } catch (error) {
      console.error(
        "Error determining supply manager role from assetUsersDetails:",
        error
      );
    }
  }

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
