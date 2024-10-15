"use client";

import { useTokenDetails } from "@/app/wallet/tokens/[address]/_queries/token-details";
import type { BreadcrumbItemType } from "@/components/global/breadcrumb/ellipsis-dropdown";
import { useParams } from "next/navigation";

const breadcrumbItems: BreadcrumbItemType[] = [{ label: "Tokens" }];

export default function WalletTokenDetailsPage() {
  const params = useParams();
  const address = params.address as string;
  const { data } = useTokenDetails(address);

  return <div className="WalletTokenDetailPage">{data.erc20Contract?.balances.map((balance) => balance.value)}</div>;
}
