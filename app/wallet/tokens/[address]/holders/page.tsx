"use client";

import { useParams } from "next/navigation";
import { BalancesTable } from "./balances-table";

export default function WalletTokenDetailsPage() {
  const params = useParams();
  const address = params.address as string;

  return (
    <div className="WalletTokenDetailPage">
      <BalancesTable address={address} />
    </div>
  );
}
