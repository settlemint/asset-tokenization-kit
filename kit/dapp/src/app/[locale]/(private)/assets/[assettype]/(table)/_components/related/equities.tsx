import { CreateEquityForm } from "@/components/blocks/create-forms/equities/form";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { getCurrentUserDetail } from "@/lib/queries/user/current-user-detail";
import { getTranslations } from "next-intl/server";

export async function EquitiesRelated() {
  const t = await getTranslations("private.assets.table.related");
  const userDetails = await getCurrentUserDetail();

  return (
    <RelatedGrid title={t("title")}>
      <RelatedGridItem
        title={t("equity.issue-new.title")}
        description={t("equity.issue-new.description")}
      >
        <CreateEquityForm asButton userDetails={userDetails} />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("equity.mechanics.title")}
        description={t("equity.mechanics.description")}
      >
        <Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/equity#contract-features-and-capabilities">
          <Button className="bg-accent text-primary-foreground shadow-dropdown shadow-inset hover:bg-accent-hover hover:text-primary-foreground">
            {t("equity.mechanics.button")}
          </Button>
        </Link>
      </RelatedGridItem>
      <RelatedGridItem
        title={t("equity.usecases.title")}
        description={t("equity.usecases.description")}
      >
        <Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/equity#why-digital-fund-tokens">
          <Button className="bg-accent text-primary-foreground shadow-dropdown shadow-inset hover:bg-accent-hover hover:text-primary-foreground">
            {t("equity.usecases.button")}
          </Button>
        </Link>
      </RelatedGridItem>
    </RelatedGrid>
  );
}
