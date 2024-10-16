"use client";

import { useTokenDetails } from "@/app/wallet/tokens/[address]/_queries/token-details";
import { SidePanel } from "@/components/ui-settlemint/sidepanel-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { type SearchParams, createSearchParamsCache, parseAsInteger, parseAsJson, parseAsString } from "nuqs/server";
import { formatUnits } from "viem";
import { MintTokenForm } from "./_forms/mint-token-form";

type ContractData = NonNullable<ReturnType<typeof useTokenDetails>["data"]>["erc20Contract"];

const formatLabel = (key: string): string => {
  const words = key.split(/(?=[A-Z])/).map((word) => word.toLowerCase());
  return words.map((word, index) => (index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word)).join(" ");
};

const formatValue = (key: keyof ContractData, value: unknown, decimals?: number): string => {
  if (value === null || value === undefined) return "N/A";
  if (Array.isArray(value)) return `${(value ?? []).length} item(s)`;
  if (typeof value === "object") return JSON.stringify(value);
  if (key === "totalSupply" && decimals !== undefined) {
    return formatUnits(BigInt(value as string), decimals);
  }
  return String(value);
};

const searchParamsCache = createSearchParamsCache({
  currentStep: parseAsInteger.withDefault(1),
  state: parseAsJson(),
  formId: parseAsString.withDefault(""),
});

interface WalletTokenDetailsPageProps {
  searchParams: SearchParams;
}

export default function WalletTokenDetailsPage({ searchParams }: WalletTokenDetailsPageProps) {
  const params = useParams();
  const address = params.address as string;
  const { data } = useTokenDetails(address);
  const parsedParams = searchParamsCache.parse(searchParams);

  const contract = data?.erc20Contract;

  if (!contract) {
    return <div>No contract data available</div>;
  }

  type ContractDataValue = ContractData[keyof ContractData];
  const fields = Object.entries(contract) as [keyof ContractData, ContractDataValue][];

  return (
    <>
      <SidePanel
        title="Create a new token"
        description="Easily convert your assets into digital tokens using this step-by-step wizard."
        trigger={
          <Button className="absolute right-8" variant="outline">
            Mint new tokens
          </Button>
        }
      >
        <MintTokenForm defaultValues={parsedParams.state} address={address} />
      </SidePanel>
      <Card>
        <CardHeader>
          <CardTitle>Token Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(([key, value]) => (
              <div key={key}>
                <dt className="text-sm font-medium text-muted-foreground">{formatLabel(key)}</dt>
                <dd className="mt-1 text-sm">{formatValue(key, value)}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </>
  );
}
