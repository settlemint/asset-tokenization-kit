import { CreateStablecoinForm } from "@/components/blocks/create-forms/stablecoin/form";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { getCurrentUserDetail } from "@/lib/queries/user/user-detail";
import { getTranslations } from "next-intl/server";

export async function StablecoinsRelated() {
  const t = await getTranslations("private.assets.table.related");
  const userDetails = await getCurrentUserDetail();

  return (
    <RelatedGrid title={t("title")}>
      <RelatedGridItem
        title={t("stablecoin.issue-new.title")}
        description={t("stablecoin.issue-new.description")}
      >
        <CreateStablecoinForm asButton userDetails={userDetails} />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("stablecoin.mechanics.title")}
        description={t("stablecoin.mechanics.description")}
      >
        <Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/stablecoin#contract-features-and-capabilities">
          <Button className="bg-accent text-primary-foreground shadow-dropdown shadow-inset hover:bg-accent-hover hover:text-primary-foreground">
            {t("stablecoin.mechanics.button")}
          </Button>
        </Link>
      </RelatedGridItem>
      <RelatedGridItem
        title={t("stablecoin.usecases.title")}
        description={t("stablecoin.usecases.description")}
      >
        <Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/stablecoin#why-digital-fund-tokens">
          <Button className="bg-accent text-primary-foreground shadow-dropdown shadow-inset hover:bg-accent-hover hover:text-primary-foreground">
            {t("stablecoin.usecases.button")}
          </Button>
        </Link>
      </RelatedGridItem>
    </RelatedGrid>
  );
}
