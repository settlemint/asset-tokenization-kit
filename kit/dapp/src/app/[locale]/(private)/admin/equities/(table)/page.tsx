import { DataTable } from "@/components/blocks/data-table/data-table";
import { PageHeader } from "@/components/layout/page-header";
import { getEquityList } from "@/lib/queries/equity/equity-list";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useEquityColumns } from "./_components/columns";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
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
      <PageHeader title={t("page-title")} />

      <DataTable
        columnHook={useEquityColumns}
        data={equities}
        name={"equities"}
      />
    </>
  );
}
