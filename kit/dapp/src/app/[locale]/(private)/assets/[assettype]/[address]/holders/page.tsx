import { DataTable } from "@/components/blocks/data-table/data-table";
import { getAssetBalanceList } from "@/lib/queries/asset-balance/asset-balance-list";
import type { AssetType } from "@/lib/utils/zod";
import type { Locale } from "next-intl";
import type { Address } from "viem";
import { columns } from "./_components/columns";

interface PageProps {
  params: Promise<{ locale: Locale; address: Address; assettype: AssetType }>;
}

export default async function BondHoldersPage({ params }: PageProps) {
  const { address, assettype } = await params;
  const balances = await getAssetBalanceList({ address });

  return (
    <DataTable
      columnParams={{
        assettype,
      }}
      columns={columns}
      data={balances}
      name={"Holders"}
    />
  );
}
