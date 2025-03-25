import { CreateBondForm } from "@/components/blocks/create-forms/bonds/form";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { getCurrentUserDetail } from "@/lib/queries/user/current-user-detail";
import { getTranslations } from "next-intl/server";

export async function BondsRelated() {
  const t = await getTranslations("private.assets.table.related");
  const userDetails = await getCurrentUserDetail();

  return (
    <RelatedGrid title={t("title")}>
      <RelatedGridItem
        title={t("bond.issue-new.title")}
        description={t("bond.issue-new.description")}
      >
        <CreateBondForm asButton userDetails={userDetails} />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("bond.mechanics.title")}
        description={t("bond.mechanics.description")}
      >
        <Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/bond#contract-features-and-capabilities">
          <Button className="bg-accent text-primary-foreground shadow-dropdown shadow-inset hover:bg-accent-hover hover:text-primary-foreground">
            {t("bond.mechanics.button")}
          </Button>
        </Link>
      </RelatedGridItem>
      <RelatedGridItem
        title={t("bond.usecases.title")}
        description={t("bond.usecases.description")}
      >
        <Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/bond#why-digital-fund-tokens">
          <Button className="bg-accent text-primary-foreground shadow-dropdown shadow-inset hover:bg-accent-hover hover:text-primary-foreground">
            {t("bond.usecases.button")}
          </Button>
        </Link>
      </RelatedGridItem>
    </RelatedGrid>
  );
}
