import { DataTable } from "@/components/blocks/data-table/data-table";
import { getAssetBalanceList } from "@/lib/queries/asset-balance/asset-balance-list";
import { getFundDetail } from "@/lib/queries/fund/fund-detail";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { icons, useHoldersColumns } from "./_components/columns";

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
    namespace: "admin.funds.holders",
  });

  return {
    title: t("holders-page-title", {
      name: fund?.name,
    }),
    description: t("holders-page-description", {
      name: fund?.name,
    }),
  };
}

export default async function FundHoldersPage({ params }: PageProps) {
  const { address } = await params;
  const balances = await getAssetBalanceList({ address });

  return (
    <DataTable
      columnHook={useHoldersColumns}
      data={balances}
      icons={icons}
      name={"Holders"}
    />
  );
}
