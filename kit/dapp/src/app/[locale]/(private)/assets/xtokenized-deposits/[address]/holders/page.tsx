import { DataTable } from "@/components/blocks/data-table/data-table";
import { getAssetBalanceList } from "@/lib/queries/asset-balance/asset-balance-list";
import { getTokenizedDepositDetail } from "@/lib/queries/tokenizeddeposit/tokenizeddeposit-detail";
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
  const tokenizedDeposit = await getTokenizedDepositDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: "admin.asset-holders-tab",
  });

  return {
    title: t("holders-page-title", {
      name: tokenizedDeposit?.name,
    }),
    description: t("holders-page-description", {
      name: tokenizedDeposit?.name,
    }),
  };
}

export default async function TokenizedDepositHoldersPage({
  params,
}: PageProps) {
  const { address } = await params;
  const balances = await getAssetBalanceList({ address });

  return <DataTable columns={columns} data={balances} name={"Holders"} />;
}
