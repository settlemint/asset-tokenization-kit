import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { MintForm } from "../../../_components/mint-form/form";

interface CryptocurrenciesRelatedProps {
  address: Address;
}

export async function CryptocurrenciesRelated({
  address,
}: CryptocurrenciesRelatedProps) {
  const t = await getTranslations("private.assets.details.related");

  return (
    <RelatedGrid title={t("title")}>
      <RelatedGridItem
        title={t("cryptocurrencies.increase-supply.title")}
        description={t("cryptocurrencies.increase-supply.description")}
      >
        <MintForm address={address} assettype="cryptocurrency" asButton />
      </RelatedGridItem>
    </RelatedGrid>
  );
}
