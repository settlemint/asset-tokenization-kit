import { BurnForm } from "@/app/[locale]/(private)/portfolio/my-assets/[assettype]/[address]/_components/burn-form/form";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { ROLES } from "@/lib/config/roles";
import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getAssetUsersDetail } from "@/lib/queries/asset/asset-users-detail";
import type { getStableCoinDetail } from "@/lib/queries/stablecoin/stablecoin-detail";
import { isBefore } from "date-fns";
import { getTranslations } from "next-intl/server";
import { getAddress, type Address } from "viem";
import { UpdateCollateralForm } from "../../../_components/manage-dropdown/update-collateral-form/form";
import { MintForm } from "../../../_components/mint-form/form";

interface StablecoinsRelatedProps {
  address: Address;
  assetDetails: Awaited<ReturnType<typeof getStableCoinDetail>>;
  userBalance: Awaited<ReturnType<typeof getAssetBalanceDetail>>;
  assetUsersDetails?: Awaited<ReturnType<typeof getAssetUsersDetail>>;
  currentUserWallet?: Address;
}

export async function StablecoinsRelated({
  address,
  assetDetails,
  userBalance,
  assetUsersDetails,
  currentUserWallet,
}: StablecoinsRelatedProps) {
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

  const stablecoin = assetDetails;
  const maxMint = stablecoin.freeCollateral;

  return (
    <RelatedGrid title={t("title")}>
      <RelatedGridItem
        title={t("update-collateral.title")}
        description={t("update-collateral.description.stablecoins")}
      >
        <UpdateCollateralForm
          address={address}
          assettype="stablecoin"
          asButton
          disabled={isBlocked || isPaused || !userIsSupplyManager}
          decimals={assetDetails.decimals}
          symbol={assetDetails.symbol}
        />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("increase-supply.title.stablecoins")}
        description={t("increase-supply.description.stablecoins")}
      >
        <MintForm
          address={address}
          decimals={assetDetails.decimals}
          symbol={assetDetails.symbol}
          max={maxMint}
          assettype="stablecoin"
          asButton
          disabled={
            isBlocked || isPaused || !userIsSupplyManager || collateralIsExpired
          }
        />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("decrease-supply.title.stablecoins")}
        description={t("decrease-supply.description.stablecoins")}
      >
        <BurnForm
          address={address}
          max={userBalance?.available ?? 0}
          decimals={assetDetails.decimals}
          symbol={assetDetails.symbol}
          assettype="stablecoin"
          asButton
          disabled={
            isBlocked || isPaused || !userIsSupplyManager || collateralIsExpired
          }
        />
      </RelatedGridItem>
    </RelatedGrid>
  );
}
