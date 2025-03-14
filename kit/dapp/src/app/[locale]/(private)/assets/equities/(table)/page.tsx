import { DataTable } from "@/components/blocks/data-table/data-table";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { TopInfo } from "@/components/blocks/top-info/top-info";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { getEquityList } from "@/lib/queries/equity/equity-list";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { CreateEquityForm } from "../_components/create-form/form";
import { columns } from "./_components/columns";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "admin.equities.table",
  });

  return {
    title: t("page-title"),
    description: t("page-description"),
  };
}

export default async function EquitiesPage() {
  const t = await getTranslations("admin.equities.table");
  const equities = await getEquityList();

  return (
    <>
      <PageHeader title={t("page-title")} section={t("asset-management")} />
      <TopInfo title={t("topinfo-title")}>
        <p>{t("topinfo-description")}</p>
      </TopInfo>
      <DataTable columns={columns} data={equities} name={"equities"} />
      <RelatedGrid title={t("related-actions.title")}>
        <RelatedGridItem
          title={t("related-actions.issue-new.title")}
          description={t("related-actions.issue-new.description")}
        >
          <CreateEquityForm asButton />
        </RelatedGridItem>
        <RelatedGridItem
          title={t("related-actions.mechanics.title")}
          description={t("related-actions.mechanics.description")}
        >
          <Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/equity#contract-features-and-capabilities">
            <Button variant="secondary">
              {t("related-actions.mechanics.button")}
            </Button>
          </Link>
        </RelatedGridItem>
        <RelatedGridItem
          title={t("related-actions.usecases.title")}
          description={t("related-actions.usecases.description")}
        >
          <Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/equity#why-digital-fund-tokens">
            <Button variant="secondary">
              {t("related-actions.usecases.button")}
            </Button>
          </Link>
        </RelatedGridItem>
      </RelatedGrid>
    </>
  );
}
