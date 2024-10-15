"use client";

import { useTokenDetails } from "@/app/wallet/tokens/[address]/_queries/token-details";
import type { BreadcrumbItemType } from "@/components/global/breadcrumb/ellipsis-dropdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { formatUnits } from "viem";

const breadcrumbItems: BreadcrumbItemType[] = [{ label: "Tokens" }];

type ContractData = NonNullable<ReturnType<typeof useTokenDetails>["data"]>["erc20Contract"];

const formatLabel = (key: string): string => {
  const words = key.split(/(?=[A-Z])/).map((word) => word.toLowerCase());
  return words.map((word, index) => (index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word)).join(" ");
};

const formatValue = (key: keyof ContractData, value: unknown, decimals?: number): string => {
  if (value === null || value === undefined) return "N/A";
  if (Array.isArray(value)) return `${value.length} item(s)`;
  if (typeof value === "object") return JSON.stringify(value);
  if (key === "totalSupply" && decimals !== undefined) {
    return formatUnits(BigInt(value as string), decimals);
  }
  return String(value);
};

export default function WalletTokenDetailsPage() {
  const params = useParams();
  const address = params.address as string;
  const { data } = useTokenDetails(address);

  const contract = data?.erc20Contract;

  if (!contract) {
    return <div>No contract data available</div>;
  }

  type ContractDataValue = ContractData[keyof ContractData];
  const fields = Object.entries(contract) as [keyof ContractData, ContractDataValue][];

  return (
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
  );
}
