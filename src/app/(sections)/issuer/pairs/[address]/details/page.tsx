"use client";

import { SidePanel } from "@/components/blocks/sidepanel/sidepanel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useParams } from "next/navigation";
import type { Address } from "viem";
import { usePairDetails } from "../_queries/pair-details";
import { StakeTokenForm } from "./_forms/stake-token-form";

type ContractData = NonNullable<ReturnType<typeof usePairDetails>["data"]>["erc20DexPair"];

const formatLabel = (key: string): string => {
  const words = key.split(/(?=[A-Z])/).map((word) => word.toLowerCase());
  return words.map((word, index) => (index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word)).join(" ");
};

const formatValue = (value: unknown, fieldName: string): string => {
  if (value === null || value === undefined) return "N/A";
  if (Array.isArray(value)) return `${(value ?? []).length}`;
  if (typeof value === "object" && value !== null) {
    if ("name" in value && "symbol" in value) {
      return `${value.name} (${value.symbol})`;
    }
    return JSON.stringify(value);
  }
  if (fieldName === "swapFee") {
    return `${(Number(value) / 100).toFixed(2)}%`;
  }
  return String(value);
};

export default function WalletTokenDetailsPage() {
  const params = useParams();
  const address = params.address as string;
  const { data } = usePairDetails(address);

  const contract = data?.erc20DexPair;

  if (!contract) {
    return <div>No contract data available</div>;
  }

  type ContractDataValue = ContractData[keyof ContractData];
  const fields = Object.entries(contract) as [keyof ContractData, ContractDataValue][];

  return (
    <>
      <SidePanel
        title="Mint new tokens"
        description="Generate and distribute your digital tokens to your token holders."
        trigger={
          <div className="fixed right-8 top-24 flex items-center space-x-2">
            <Button>Add Stake</Button>
          </div>
        }
      >
        <div className="p-8">
          <StakeTokenForm
            defaultValues={{
              tokenAddress: address as Address,
              baseTokenAddress: contract.baseToken.id as Address,
              quoteTokenAddress: contract.quoteToken.id as Address,
            }}
            formId="stake-token-form"
          />
        </div>
      </SidePanel>
      <h3 className="text-lg font-semibold text-primary">Liquidity Pool Details</h3>
      <Card className="p-4">
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {fields
            .filter(([key]) => !["id", "name", "balances", "transfers"].includes(key))
            .map(([key, value]) => (
              <div key={key}>
                <dt className="text-sm font-medium text-muted-foreground">{formatLabel(key)}</dt>
                <dd className="mt-1 text-sm">{formatValue(value, key)}</dd>
              </div>
            ))}
        </dl>
      </Card>
      {/* <TokenCharts token={address} /> */}
    </>
  );
}
