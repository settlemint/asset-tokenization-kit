import { DataTable } from "@/components/blocks/data-table/data-table";
import { getAssetBalanceList } from "@/lib/queries/asset-balance/asset-balance-list";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { getTokenizedDepositDetail } from "@/lib/queries/tokenizeddeposit/tokenizeddeposit-detail";
import type { AssetType } from "@/lib/utils/zod";
import type { Locale } from "next-intl";
import type { Address } from "viem";
import { columns } from "./_components/columns";

interface PageProps {
  params: Promise<{ locale: Locale; address: Address; assettype: AssetType }>;
}

export default async function BondHoldersPage({ params }: PageProps) {
  const { address, assettype } = await params;
  const [balances, assetDetails] = await Promise.all([
    getAssetBalanceList({ address }),
    getAssetDetail({ address, assettype }),
  ]);

  let mintMaxLimit: number | undefined = undefined;
  if (assettype === "stablecoin" || assettype === "tokenizeddeposit") {
    const tokenizedDeposit = assetDetails as Awaited<
      ReturnType<typeof getTokenizedDepositDetail>
    >;
    const freeCollateral = tokenizedDeposit.freeCollateral;
    mintMaxLimit = freeCollateral;
  }

  return (
    <DataTable
      columnParams={{
        mintMaxLimit,
      }}
      columns={columns}
      data={balances}
      name={"Holders"}
    />
  );
}
