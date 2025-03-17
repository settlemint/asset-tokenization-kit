import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { BurnForm } from "../../../_components/manage-dropdown/burn-form/form";
import { MintForm } from "../../../_components/manage-dropdown/mint-form/form";

interface FundsRelatedProps {
  address: Address;
  totalSupply: number;
}

export async function FundsRelated({
  address,
  totalSupply,
}: FundsRelatedProps) {
  const t = await getTranslations("private.assets.details.related");

  return (
    <RelatedGrid title={t("title")}>
      <RelatedGridItem
        title={t("funds.increase-supply.title")}
        description={t("funds.increase-supply.description")}
      >
        <MintForm address={address} assettype="fund" asButton />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("funds.decrease-supply.title")}
        description={t("funds.decrease-supply.description")}
      >
        <BurnForm
          address={address}
          balance={totalSupply}
          assettype="fund"
          asButton
        />
      </RelatedGridItem>
    </RelatedGrid>
  );
}
