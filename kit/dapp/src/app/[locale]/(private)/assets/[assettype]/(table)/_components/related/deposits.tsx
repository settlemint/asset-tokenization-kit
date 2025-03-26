import { CreateDepositForm } from "@/components/blocks/create-forms/deposit/form";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { getCurrentUserDetail } from "@/lib/queries/user/current-user-detail";
import { getTranslations } from "next-intl/server";

export async function DepositsRelated() {
  const t = await getTranslations("private.assets.table.related");
  const userDetails = await getCurrentUserDetail();

  return (
    <RelatedGrid title={t("title")}>
      <RelatedGridItem
        title={t("deposit.issue-new.title")}
        description={t("deposit.issue-new.description")}
      >
        <CreateDepositForm asButton userDetails={userDetails} />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("deposit.mechanics.title")}
        description={t("deposit.mechanics.description")}
      >
        <Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/stablecoin#contract-features-and-capabilities">
          <Button className="bg-accent text-primary-foreground shadow-dropdown shadow-inset hover:bg-accent-hover hover:text-primary-foreground">
            {t("deposit.mechanics.button")}
          </Button>
        </Link>
      </RelatedGridItem>
      <RelatedGridItem
        title={t("deposit.usecases.title")}
        description={t("deposit.usecases.description")}
      >
        <Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/stablecoin#why-digital-fund-tokens">
          <Button className="bg-accent text-primary-foreground shadow-dropdown shadow-inset hover:bg-accent-hover hover:text-primary-foreground">
            {t("deposit.usecases.button")}
          </Button>
        </Link>
      </RelatedGridItem>
    </RelatedGrid>
  );
}
