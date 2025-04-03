import { BurnForm } from "@/app/[locale]/(private)/portfolio/my-assets/[assettype]/[address]/_components/burn-form/form";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { getAssetUsersDetail } from "@/lib/queries/asset/asset-users-detail";
import { isSupplyManager } from "@/lib/utils/has-role";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { MintForm } from "../../../_components/mint-form/form";

export interface CryptocurrenciesRelatedProps {
  address: `0x${string}`;
  assetDetails: Awaited<ReturnType<typeof getAssetDetail>>;
  userBalance: Awaited<ReturnType<typeof getAssetBalanceDetail>>;
  assetUsersDetails?: Awaited<ReturnType<typeof getAssetUsersDetail>>;
  currentUserWallet?: Address;
}

export async function CryptocurrenciesRelated({
  address,
  assetDetails,
  userBalance,
  assetUsersDetails,
  currentUserWallet,
}: CryptocurrenciesRelatedProps) {
  const t = await getTranslations("private.assets.details.related");

  const isBlocked = userBalance?.blocked ?? false;
  const isPaused = "paused" in assetDetails && assetDetails.paused;

  const userIsSupplyManager = isSupplyManager(
    currentUserWallet,
    assetUsersDetails
  );

  return (
    <RelatedGrid title={t("title")}>
      <RelatedGridItem
        title={t("increase-supply.title.cryptocurrencies")}
        description={t("increase-supply.description.cryptocurrencies")}
      >
        <MintForm
          address={address}
          assettype="cryptocurrency"
          decimals={assetDetails.decimals}
          symbol={assetDetails.symbol}
          asButton
          disabled={isBlocked || isPaused || !userIsSupplyManager}
        />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("decrease-supply.title.cryptocurrencies")}
        description={t("decrease-supply.description.cryptocurrencies")}
      >
        <BurnForm
          address={address}
          max={userBalance?.available ?? 0}
          decimals={assetDetails.decimals}
          symbol={assetDetails.symbol}
          assettype="cryptocurrency"
          asButton
          disabled={isBlocked || isPaused || !userIsSupplyManager}
        />
      </RelatedGridItem>
    </RelatedGrid>
  );
}
