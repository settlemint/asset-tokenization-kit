import { useStableCoinColumns } from "@/app/[locale]/(private)/admin/stablecoins/(table)/_components/columns";
import { DataTable } from "@/components/blocks/data-table/data-table";
import { TopInfo } from "@/components/blocks/top-info/top-info";
import { PageHeader } from "@/components/layout/page-header";
import { getStableCoinList } from "@/lib/queries/stablecoin/stablecoin-list";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

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
      <DataTable
        columnHook={useStableCoinColumns}
        data={stablecoins}
        name={"stablecoins"}
      />
    </>
  );
}
