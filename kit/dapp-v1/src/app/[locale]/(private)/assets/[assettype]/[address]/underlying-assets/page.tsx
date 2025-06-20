import { DataTable } from "@/components/blocks/data-table/data-table";
import { getAssetBalanceList } from "@/lib/queries/asset-balance/asset-balance-list";
import type { Locale } from "next-intl";
import type { Address } from "viem";
import { Columns } from "./_components/columns";

interface PageProps {
  params: Promise<{
    locale: Locale;
    address: Address;
  }>;
}

export default async function UnderlyingAssetsPage({ params }: PageProps) {
  const { address } = await params;
  const balances = await getAssetBalanceList({ wallet: address });

  return (
    <DataTable columns={Columns} data={balances} name={"underlying-assets"} />
  );
}
