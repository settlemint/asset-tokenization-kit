import { DataTable } from "@/components/blocks/data-table/data-table";
import { PageHeader } from "@/components/layout/page-header";
import { getAssetDetail } from "@/lib/queries/asset/asset-detail";
import { getBondDetail } from "@/lib/queries/bond/bond-detail";
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
  const bond = await getBondDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: "admin.bonds.permissions",
  });

  return {
    title: t("permissions-page-title", {
      name: bond?.name,
    }),
    description: t("permissions-page-description", {
      name: bond?.name,
    }),
  };
}

export default async function BondTokenPermissionsPage({ params }: PageProps) {
  const { address } = await params;
  const bond = await getBondDetail({ address });
  const assetDetail = await getAssetDetail({ address });
  const t = await getTranslations("admin.bonds.permissions");

  return (
    <>
      <PageHeader
        title={t("page-title", { name: bond?.name })}
        subtitle={t("page-description", { name: bond?.name })}
      />
      <DataTable
        columnParams={{
          address,
        }}
        columns={columns}
        data={assetDetail.roles}
        name={t("table-title")}
      />
    </>
  );
}
