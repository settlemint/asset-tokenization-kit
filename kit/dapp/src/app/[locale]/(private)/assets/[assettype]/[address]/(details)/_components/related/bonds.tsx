import { BurnForm } from "@/app/[locale]/(private)/portfolio/my-assets/[assettype]/[address]/_components/burn-form/form";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { ROLES } from "@/lib/config/roles";
import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { getAssetUsersDetail } from "@/lib/queries/asset/asset-users-detail";
import { getTranslations } from "next-intl/server";
import { getAddress, type Address } from "viem";
import { MintForm } from "../../../_components/mint-form/form";

interface BondsRelatedProps {
  address: Address;
  assetDetails: Awaited<ReturnType<typeof getAssetDetail>>;
  userBalance: Awaited<ReturnType<typeof getAssetBalanceDetail>>;
  assetUsersDetails?: Awaited<ReturnType<typeof getAssetUsersDetail>>;
  currentUserWallet?: Address;
}

export async function BondsRelated({
  address,
  assetDetails,
  userBalance,
  assetUsersDetails,
  currentUserWallet,
}: BondsRelatedProps) {
  const t = await getTranslations("private.assets.details.related");

  const isBlocked = userBalance?.blocked ?? false; // Still useful for general blocking
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
          disabled={isBlocked || isPaused || !userIsSupplyManager}
        />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("decrease-supply.title.bonds")}
        description={t("decrease-supply.description.bonds")}
      >
        <BurnForm
          address={address}
          max={userBalance?.available ?? 0} // Keep userBalance for balance info
          decimals={assetDetails.decimals}
          symbol={assetDetails.symbol}
          assettype="bond"
          asButton
          disabled={isBlocked || isPaused || !userIsSupplyManager}
        />
      </RelatedGridItem>
    </RelatedGrid>
  );
}
