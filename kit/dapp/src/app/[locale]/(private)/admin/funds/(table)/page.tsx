import { DataTable } from "@/components/blocks/data-table/data-table";
import { PageHeader } from "@/components/layout/page-header";
import { getFundList } from "@/lib/queries/fund/fund-list";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useFundColumns } from "./_components/columns";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "admin.funds.table",
  });

  return {
    title: t("page-title"),
    description: t("page-description"),
  };
}

export default async function FundsPage() {
  const t = await getTranslations("admin.funds.table");
  const funds = await getFundList();

  return (
    <>
      <PageHeader title={t("page-title")} />

      <DataTable columnHook={useFundColumns} data={funds} name={"funds"} />
    </>
  );
}
