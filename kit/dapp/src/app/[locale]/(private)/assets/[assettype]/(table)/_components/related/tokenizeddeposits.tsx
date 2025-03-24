import { CreateTokenizedDepositForm } from "@/components/blocks/create-forms/tokenized-deposits/form";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

export async function TokenizedDepositsRelated() {
  const t = await getTranslations("private.assets.table.related");

  return (
    <RelatedGrid title={t("title")}>
      <RelatedGridItem
        title={t("tokenizeddeposit.issue-new.title")}
        description={t("tokenizeddeposit.issue-new.description")}
      >
        <CreateTokenizedDepositForm asButton />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("tokenizeddeposit.mechanics.title")}
        description={t("tokenizeddeposit.mechanics.description")}
      >
        <Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/stablecoin#contract-features-and-capabilities">
          <Button className="bg-accent text-primary-foreground shadow-dropdown shadow-inset hover:bg-accent-hover hover:text-primary-foreground">
            {t("tokenizeddeposit.mechanics.button")}
          </Button>
        </Link>
      </RelatedGridItem>
      <RelatedGridItem
        title={t("tokenizeddeposit.usecases.title")}
        description={t("tokenizeddeposit.usecases.description")}
      >
        <Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/stablecoin#why-digital-fund-tokens">
          <Button className="bg-accent text-primary-foreground shadow-dropdown shadow-inset hover:bg-accent-hover hover:text-primary-foreground">
            {t("tokenizeddeposit.usecases.button")}
          </Button>
        </Link>
      </RelatedGridItem>
    </RelatedGrid>
  );
}
