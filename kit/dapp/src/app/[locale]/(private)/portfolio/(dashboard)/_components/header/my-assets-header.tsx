"use client";

import type { AssetBalance } from "@/lib/queries/asset-balance/asset-balance-fragment";
import type { Address } from "viem";
import { TransferForm } from "../../../_components/transfer-form/form";
import { MyAssetsCount } from "./my-assets-count";

interface MyAssetsHeaderProps {
  data: {
    total: string;
    balances: AssetBalance[];
  };
  userAddress: Address;
}

export function MyAssetsHeader({ data, userAddress }: MyAssetsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <MyAssetsCount total={data.total} />
      <TransferForm userAddress={userAddress} asButton />
    </div>
  );
}
