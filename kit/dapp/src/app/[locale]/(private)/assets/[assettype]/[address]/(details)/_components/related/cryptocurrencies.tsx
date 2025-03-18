import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { MintForm } from "../../../_components/manage-dropdown/mint-form/form";

interface CryptocurrenciesRelatedProps {
  address: Address;
  assetDetails: Awaited<ReturnType<typeof getAssetDetail>>;
  userBalance: Awaited<ReturnType<typeof getAssetBalanceDetail>>;
}

export async function CryptocurrenciesRelated({
  address,
  assetDetails,
  userBalance,
}: CryptocurrenciesRelatedProps) {
  const t = await getTranslations("private.assets.details.related");

  const isBlocked = userBalance?.blocked ?? false;
  const isPaused = "paused" in assetDetails && assetDetails.paused;
  const userIsSupplyManager = userBalance?.asset.supplyManagers.some(
    (manager) => manager.id === userBalance?.account.id
  );

  return (
    <RelatedGrid title={t("title")}>
      <RelatedGridItem
        title={t("cryptocurrencies.increase-supply.title")}
        description={t("cryptocurrencies.increase-supply.description")}
      >
        <MintForm
          address={address}
          assettype="cryptocurrency"
          asButton
          disabled={isBlocked || isPaused || !userIsSupplyManager}
        />
      </RelatedGridItem>
    </RelatedGrid>
  );
}
