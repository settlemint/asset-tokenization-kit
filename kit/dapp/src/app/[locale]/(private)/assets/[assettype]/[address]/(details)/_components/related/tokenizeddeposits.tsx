import { UpdateCollateralForm } from "@/app/[locale]/(private)/assets/[assettype]/[address]/_components/manage-dropdown/update-collateral-form/form";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { BurnForm } from "../../../_components/manage-dropdown/burn-form/form";
import { MintForm } from "../../../_components/mint-form/form";

interface TokenizedDepositsRelatedProps {
  address: Address;
  totalSupply: number;
}

export async function TokenizedDepositsRelated({
  address,
  totalSupply,
}: TokenizedDepositsRelatedProps) {
  const t = await getTranslations("private.assets.details.related");

  return (
    <RelatedGrid title={t("title")}>
      <RelatedGridItem
        title={t("tokenizeddeposits.update-collateral.title")}
        description={t("tokenizeddeposits.update-collateral.description")}
      >
        <UpdateCollateralForm
          address={address}
          assettype="tokenizeddeposit"
          asButton
        />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("tokenizeddeposits.increase-supply.title")}
        description={t("tokenizeddeposits.increase-supply.description")}
      >
        <MintForm address={address} assettype="tokenizeddeposit" asButton />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("tokenizeddeposits.decrease-supply.title")}
        description={t("tokenizeddeposits.decrease-supply.description")}
      >
        <BurnForm
          address={address}
          balance={totalSupply}
          assettype="tokenizeddeposit"
          asButton
        />
      </RelatedGridItem>
    </RelatedGrid>
  );
}
