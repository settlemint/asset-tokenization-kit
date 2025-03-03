import { DataTable } from "@/components/blocks/data-table/data-table";
import { PageHeader } from "@/components/layout/page-header";
import { getAssetDetail } from "@/lib/queries/asset/asset-detail";
import { getFundDetail } from "@/lib/queries/fund/fund-detail";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { columns } from "./_components/columns";

interface PageProps {
  params: Promise<{ locale: string; address: Address }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; address: Address }>;
}): Promise<Metadata> {
  const { address, locale } = await params;
  const fund = await getFundDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: "admin.funds.permissions",
  });

  return {
    title: t("permissions-page-title", {
      name: fund?.name,
    }),
    description: t("permissions-page-description", {
      name: fund?.name,
    }),
  };
}

export default async function FundTokenPermissionsPage({ params }: PageProps) {
  const { address } = await params;
  const fund = await getFundDetail({ address });
  const assetDetail = await getAssetDetail({ address });
  const t = await getTranslations("admin.funds.permissions");

  return (
    <>
      <PageHeader
        title={t("page-title", { name: fund?.name })}
        subtitle={t("page-description", { name: fund?.name })}
      />
      <DataTable
        columns={() => columns(address)}
        data={assetDetail.roles}
        name={t("table-title")}
      />
    </>
  );
}
