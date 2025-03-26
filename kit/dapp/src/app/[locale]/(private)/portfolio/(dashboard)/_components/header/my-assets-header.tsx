"use client";

import type { AssetBalance } from "@/lib/queries/asset-balance/asset-balance-fragment";
import type {} from "@/lib/queries/user/current-user-detail";
import type { UserDetail } from "@/lib/queries/user/user-schema";
import type { Price } from "@/lib/utils/typebox/price";
import { TransferForm } from "../../../_components/transfer-form/form";
import { MyAssetsCount } from "./my-assets-count";
interface MyAssetsHeaderProps {
  data: {
    total: string;
    balances: AssetBalance[];
  };
  totalValue: Price;
  userDetails: UserDetail;
}

export function MyAssetsHeader({
  data,
  totalValue,
  userDetails,
}: MyAssetsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <MyAssetsCount totalCount={data.total} totalValue={totalValue} />
      <TransferForm userAddress={userDetails.wallet} asButton />
    </div>
  );
}
