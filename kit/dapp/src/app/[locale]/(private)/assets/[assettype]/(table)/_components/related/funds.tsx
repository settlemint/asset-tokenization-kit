import { CreateFundForm } from "@/components/blocks/create-forms/funds/form";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

export async function FundsRelated() {
  const t = await getTranslations("private.assets.table.related");

  return (
    <RelatedGrid title={t("title")}>
      <RelatedGridItem
        title={t("fund.issue-new.title")}
        description={t("fund.issue-new.description")}
      >
        <CreateFundForm asButton />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("fund.mechanics.title")}
        description={t("fund.mechanics.description")}
      >
        <Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/fund#contract-features-and-capabilities">
          <Button className="bg-accent text-primary-foreground shadow-dropdown shadow-inset hover:bg-accent-hover hover:text-primary-foreground">
            {t("fund.mechanics.button")}
          </Button>
        </Link>
      </RelatedGridItem>
      <RelatedGridItem
        title={t("fund.usecases.title")}
        description={t("fund.usecases.description")}
      >
        <Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/fund#why-digital-fund-tokens">
          <Button className="bg-accent text-primary-foreground shadow-dropdown shadow-inset hover:bg-accent-hover hover:text-primary-foreground">
            {t("fund.usecases.button")}
          </Button>
        </Link>
      </RelatedGridItem>
    </RelatedGrid>
  );
}
