import { DataTable } from "@/components/blocks/data-table/data-table";
import { getAssetBalanceList } from "@/lib/queries/asset-balance/asset-balance-list";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { getDepositDetail } from "@/lib/queries/deposit/deposit-detail";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
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

  let maxMint: number | undefined = undefined;
  if (assettype === "stablecoin" || assettype === "deposit") {
    const deposit = assetDetails as Awaited<
      ReturnType<typeof getDepositDetail>
    >;
    const freeCollateral = deposit.freeCollateral;
    maxMint = freeCollateral;
  }

  return (
    <DataTable
      columnParams={{
        maxMint,
        decimals: assetDetails.decimals,
        price: assetDetails.price,
      }}
      columns={columns}
      data={balances}
      name={"Holders"}
    />
  );
}
