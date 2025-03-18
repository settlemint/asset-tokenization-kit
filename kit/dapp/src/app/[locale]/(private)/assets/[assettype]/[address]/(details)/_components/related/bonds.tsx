import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { BurnForm } from "../../../_components/manage-dropdown/burn-form/form";
import { MintForm } from "../../../_components/mint-form/form";

interface BondsRelatedProps {
  address: Address;
  totalSupply: number;
}

export async function BondsRelated({
  address,
  totalSupply,
}: BondsRelatedProps) {
  const t = await getTranslations("private.assets.details.related");

  return (
    <RelatedGrid title={t("title")}>
      <RelatedGridItem
        title={t("bonds.increase-supply.title")}
        description={t("bonds.increase-supply.description")}
      >
        <MintForm address={address} assettype="bond" asButton />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("bonds.decrease-supply.title")}
        description={t("bonds.decrease-supply.description")}
      >
        <BurnForm
          address={address}
          balance={totalSupply}
          assettype="bond"
          asButton
        />
      </RelatedGridItem>
    </RelatedGrid>
  );
}
