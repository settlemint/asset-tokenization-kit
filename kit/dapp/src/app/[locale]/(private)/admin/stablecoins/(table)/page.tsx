import { DataTable } from "@/components/blocks/data-table/data-table";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { TopInfo } from "@/components/blocks/top-info/top-info";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { getStableCoinList } from "@/lib/queries/stablecoin/stablecoin-list";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CreateStablecoinForm } from "../_components/create-form/form";
import { columns } from "./_components/columns";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "admin.stablecoins.table",
  });

  return {
    title: t("page-title"),
    description: t("page-description"),
  };
}

export default async function StableCoinsPage() {
  const t = await getTranslations("admin.stablecoins.table");
  const stablecoins = await getStableCoinList();

  return (
    <>
      <PageHeader title={t("page-title")} />
      <TopInfo title={t("topinfo-title")}>
        <p>{t("topinfo-description")}</p>
      </TopInfo>
      <DataTable columns={columns} data={stablecoins} name={"stablecoins"} />
      <RelatedGrid title={t("related-actions.title")}>
        <RelatedGridItem
          title={t("related-actions.issue-new.title")}
          description={t("related-actions.issue-new.description")}
        >
          <CreateStablecoinForm asButton />
        </RelatedGridItem>
        <RelatedGridItem
          title={t("related-actions.mechanics.title")}
          description={t("related-actions.mechanics.description")}
        >
          <Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/stablecoin#contract-features-and-capabilities">
            <Button variant="secondary">
              {t("related-actions.mechanics.button")}
            </Button>
          </Link>
        </RelatedGridItem>
        <RelatedGridItem
          title={t("related-actions.usecases.title")}
          description={t("related-actions.usecases.description")}
        >
          <Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/stablecoin#why-digital-fund-tokens">
            <Button variant="secondary">
              {t("related-actions.usecases.button")}
            </Button>
          </Link>
        </RelatedGridItem>
      </RelatedGrid>
    </>
  );
}
