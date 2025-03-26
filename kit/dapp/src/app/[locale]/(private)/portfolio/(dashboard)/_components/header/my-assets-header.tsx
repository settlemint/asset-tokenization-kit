"use client";

import type { AssetBalance } from "@/lib/queries/asset-balance/asset-balance-fragment";
import type {} from "@/lib/queries/user/current-user-detail";
import type { UserDetail } from "@/lib/queries/user/user-schema";
import { TransferForm } from "../../../_components/transfer-form/form";
import { MyAssetsCount } from "./my-assets-count";
interface MyAssetsHeaderProps {
  data: {
    total: string;
    balances: AssetBalance[];
  };
  userDetails: UserDetail;
}

export function MyAssetsHeader({ data, userDetails }: MyAssetsHeaderProps) {
  const totalValue = data.balances.reduce((acc, balance) => {
    return acc + balance.asset.price.amount;
  }, 0);

  return (
    <div className="flex items-center justify-between">
      <MyAssetsCount
        total={data.total}
        price={{
          amount: totalValue,
          currency: userDetails.currency,
        }}
      />
      <TransferForm userAddress={userDetails.wallet} asButton />
    </div>
  );
}
