import { DataTable } from "@/components/blocks/data-table/data-table";
import { getAssetBalanceList } from "@/lib/queries/asset-balance/asset-balance-list";
import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { columns } from "./_components/columns";

interface PageProps {
  params: Promise<{ locale: Locale; address: Address }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { address, locale } = await params;
  const bond = await getBondDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: "admin.asset-holders-tab",
  });

  return {
    title: t("holders-page-title", {
      name: bond?.name,
    }),
    description: t("holders-page-description", {
      name: bond?.name,
    }),
  };
}

export default async function BondHoldersPage({ params }: PageProps) {
  const { address } = await params;
  const balances = await getAssetBalanceList({ address });

  return <DataTable columns={columns} data={balances} name={"Holders"} />;
}
