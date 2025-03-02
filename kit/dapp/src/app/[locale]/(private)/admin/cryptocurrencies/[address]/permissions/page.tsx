import { DataTable } from "@/components/blocks/data-table/data-table";
import { PageHeader } from "@/components/layout/page-header";
import { getAssetDetail } from "@/lib/queries/asset/asset-detail";
import { getCryptoCurrencyDetail } from "@/lib/queries/cryptocurrency/cryptocurrency-detail";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { usePermissionsColumns } from "./_components/columns";

interface PageProps {
  params: Promise<{ locale: string; address: Address }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; address: Address }>;
}): Promise<Metadata> {
  const { address, locale } = await params;
  const cryptocurrency = await getCryptoCurrencyDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: "admin.cryptocurrencies.permissions",
  });

  return {
    title: t("permissions-page-title", {
      name: cryptocurrency?.name,
    }),
    description: t("permissions-page-description", {
      name: cryptocurrency?.name,
    }),
  };
}

export default async function CryptoCurrencyTokenPermissionsPage({
  params,
}: PageProps) {
  const { address } = await params;
  const cryptocurrency = await getCryptoCurrencyDetail({ address });
  const assetDetail = await getAssetDetail({ address });
  const t = await getTranslations("admin.cryptocurrencies.permissions");

  return (
    <>
      <PageHeader
        title={t("page-title", { name: cryptocurrency?.name })}
        subtitle={t("page-description", { name: cryptocurrency?.name })}
      />
      <DataTable
        columnHook={usePermissionsColumns}
        data={assetDetail.roles}
        name={t("table-title")}
      />
    </>
  );
}
