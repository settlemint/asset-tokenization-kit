import { AssetEventsTable } from "@/components/blocks/asset-events-table/asset-events-table";
import { PageHeader } from "@/components/layout/page-header";
import { getTranslations } from "next-intl/server";

export default async function ActivityPage() {
  const t = await getTranslations("admin.activity");

  return (
    <>
      <PageHeader title={t("page-title")} subtitle={t("page-description")} />

      <AssetEventsTable />
    </>
  );
}
